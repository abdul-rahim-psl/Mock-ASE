import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Transaction,
  generateWalletId,
  generateIBAN,
  findUserById,
  findUserByWalletId,
  getUserTransactions,
  getWalletTransactions,
  getTotalSystemBalance,
  updateWalletIdByIBAN
} from './data-postgres';
import { logger } from './logger';
import { prisma } from './prisma';
import { sendTransactionWebhook } from './webhooks';

export const resolvers = {
  Query: {
    getUsers: async (): Promise<User[]> => {
      try {
        const dbUsers = await prisma.user.findMany({
          include: { wallet: true }
        });

        // Use a properly typed approach to map the results
        const users = dbUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          walletId: user.walletId,
          balance: user.wallet ? Number(user.wallet.balance) : 0,
          createdAt: user.createdAt,
          iban: user.iban ?? 'no iban',
        }));

        logger.user(`Query: getUsers - Fetching all users (count: ${users.length})`);
        return users;
      } catch (error) {
        logger.error(`Failed to get users: ${error}`);
        return [];
      }
    },

    getUser: async (_: any, { id }: { id: string }): Promise<User | null> => {
      try {
        const user = await findUserById(id);
        logger.user(`Query: getUser - Fetching user by ID: ${id} - ${user ? 'Found' : 'Not found'}`);
        return user;
      } catch (error) {
        logger.error(`Failed to get user: ${error}`);
        return null;
      }
    },

    getUserByWalletId: async (_: any, { walletId }: { walletId: string }): Promise<User | null> => {
      try {
        const user = await findUserByWalletId(walletId);
        logger.wallet(`Query: getUserByWalletId - Fetching user by wallet ID: ${walletId} - ${user ? 'Found' : 'Not found'}`);
        return user;
      } catch (error) {
        logger.error(`Failed to get user by wallet ID: ${error}`);
        return null;
      }
    },

    getTransactions: async (): Promise<Transaction[]> => {
      try {
        const dbTransactions = await prisma.transaction.findMany({
          orderBy: { timestamp: 'desc' }
        });

        const transactions = dbTransactions.map((tx: { id: any; fromWalletId: any; toWalletId: any; amount: any; timestamp: any; status: string; description: any; type: string; }) => ({
          id: tx.id,
          fromWalletId: tx.fromWalletId,
          toWalletId: tx.toWalletId,
          amount: Number(tx.amount),
          timestamp: tx.timestamp,
          status: tx.status as 'COMPLETED' | 'FAILED' | 'PENDING',
          description: tx.description,
          type: tx.type as 'DEPOSIT' | 'TRANSFER'
        }));

        logger.transfer(`Query: getTransactions - Fetching all transactions (count: ${transactions.length})`);
        return transactions;
      } catch (error) {
        logger.error(`Failed to get transactions: ${error}`);
        return [];
      }
    },

    getUserTransactions: async (_: any, { userId }: { userId: string }): Promise<Transaction[]> => {
      try {
        const transactions = await getUserTransactions(userId);
        logger.transfer(`Query: getUserTransactions - Fetching transactions for user ID: ${userId} (count: ${transactions.length})`);
        return transactions;
      } catch (error) {
        logger.error(`Failed to get user transactions: ${error}`);
        return [];
      }
    },

    getWalletTransactions: async (_: any, { walletId }: { walletId: string }): Promise<Transaction[]> => {
      try {
        const transactions = await getWalletTransactions(walletId);
        logger.transfer(`Query: getWalletTransactions - Fetching transactions for wallet ID: ${walletId} (count: ${transactions.length})`);
        return transactions;
      } catch (error) {
        logger.error(`Failed to get wallet transactions: ${error}`);
        return [];
      }
    },

    getTotalSystemBalance: async (): Promise<number> => {
      try {
        const balance = await getTotalSystemBalance();
        logger.wallet(`Query: getTotalSystemBalance - Current system balance: PKR${balance.toFixed(2)}`);
        return balance;
      } catch (error) {
        logger.error(`Failed to get total system balance: ${error}`);
        return 0;
      }
    },
  },

  Mutation: {
    createUser: async (_: any, { name, email }: { name: string; email: string }): Promise<User> => {
      logger.user(`Mutation: createUser - Creating new user: ${name} (${email})`);

      try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          logger.error(`Failed to create user: Email ${email} already exists`);
          throw new Error('User with this email already exists');
        }

        const iban = generateIBAN();

        // function to call rafiki - iske against wallet address dedo

        const walletId = generateWalletId(iban);

        // Use a transaction to ensure both user and wallet are created
        const result = await prisma.$transaction(async (tx: { user: { create: (arg0: { data: { name: string; email: string; walletId: string; iban: string; }; }) => any; }; wallet: { create: (arg0: { data: { id: string; userId: any; balance: number; }; }) => any; }; }) => {
          // Create user
          const user = await tx.user.create({
            data: {
              name,
              email,
              walletId,
              iban,
            },
          });

          // Create wallet
          const wallet = await tx.wallet.create({
            data: {
              id: walletId,
              userId: user.id,
              balance: 0,
            },
          });

          return {
            ...user,
            balance: Number(wallet.balance),
          };
        });

        logger.success(`User created successfully: ${name} (ID: ${result.id}, Wallet: ${walletId})`);
        return {
          id: result.id,
          name: result.name,
          email: result.email,
          walletId: result.walletId,
          iban: result.iban,
          balance: Number(result.balance),
          createdAt: result.createdAt,
        };
      } catch (error) {
        logger.error(`Database error creating user: ${error}`);
        throw new Error(`Failed to create user: ${error}`);
      }
    },

    depositMoney: async (_: any, { userId, amount }: { userId: string; amount: number }): Promise<User> => {
      logger.wallet(`Mutation: depositMoney - Depositing PKR${amount.toFixed(2)} to user ID: ${userId}`);

      if (amount <= 0) {
        logger.error(`Deposit failed: Amount must be greater than zero (received: ${amount})`);
        throw new Error('Deposit amount must be greater than zero');
      }

      try {
        // Find user with their wallet
        const user = await findUserById(userId);
        if (!user) {
          logger.error(`Deposit failed: User not found with ID: ${userId}`);
          throw new Error('User not found');
        }

        // Use a transaction to update balance and create transaction record
        return await prisma.$transaction(async (tx: { wallet: { update: (arg0: { where: { id: string; }; data: { balance: number; }; }) => any; }; transaction: { create: (arg0: { data: { toWalletId: string; amount: number; status: string; description: string; type: string; }; }) => any; }; }) => {
          const newBalance = user.balance + amount;

          // Update wallet balance
          await tx.wallet.update({
            where: { id: user.walletId },
            data: { balance: newBalance },
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              toWalletId: user.walletId,
              amount,
              status: 'COMPLETED',
              description: `Deposit to ${user.name}'s wallet`,
              type: 'DEPOSIT',
            },
          });

          logger.success(`Deposit successful: PKR${amount.toFixed(2)} to ${user.name}'s wallet`);
          logger.wallet(`New balance for ${user.name}: PKR${newBalance.toFixed(2)}`);

          // Get the created transaction for webhook notification
          const transactions = await prisma.transaction.findMany({
            where: {
              toWalletId: user.walletId,
              type: 'DEPOSIT',
            },
            orderBy: {
              timestamp: 'desc',
            },
            take: 1,
          });

          if (transactions.length > 0) {
            const transaction = transactions[0];
            // Convert to our Transaction type
            const transactionData: Transaction = {
              id: transaction.id,
              fromWalletId: transaction.fromWalletId,
              toWalletId: transaction.toWalletId,
              amount: Number(transaction.amount),
              timestamp: transaction.timestamp,
              status: transaction.status as 'COMPLETED' | 'FAILED' | 'PENDING',
              description: transaction.description,
              type: transaction.type as 'DEPOSIT' | 'TRANSFER',
            };

            // Trigger webhook for the deposit transaction
            sendTransactionWebhook(transactionData)
              .then((success) => {
                if (success) {
                  logger.success(`Webhook notifications sent successfully for deposit ${transaction.id}`);
                } else {
                  logger.warn(`Some webhook notifications failed for deposit ${transaction.id}`);
                }
              })
              .catch((error) => {
                logger.error(`Error sending webhook notifications: ${error}`);
              });
          }

          return {
            ...user,
            balance: newBalance,
          };
        });
      } catch (error) {
        logger.error(`Database error during deposit: ${error}`);
        throw new Error(`Deposit failed: ${error}`);
      }
    },

    transferMoney: async (_: any, { fromWalletId, toWalletId, amount }: {
      fromWalletId: string;
      toWalletId: string;
      amount: number
    }): Promise<Transaction> => {
      logger.transfer(`Mutation: transferMoney - Transfer request: PKR${amount.toFixed(2)} from ${fromWalletId} to ${toWalletId}`);


      try {
        // Extract IBAN from URL format if necessary
        const extractIban = (id: string): string => {
          if (id.startsWith('https://')) {
            return id.split('/').pop() || '';
          }
          return id;
        };
        
        const sourceIban = extractIban(fromWalletId);
        const destIban = extractIban(toWalletId);

        
        

        // Format IBAN by adding a space after every 4 characters (not at the end if divisible by 4)
        const formatIban = (iban: string) => {
          const clean = iban.replace(/\s+/g, '');
          return clean.replace(/(.{4})/g, (match, p1, offset, str) => {
            // Only add a space if not at the end
            return offset + 4 < str.length ? p1 + ' ' : p1;
          });
        };

        // Find source user by IBAN (ignoring spaces)
        const sourceUser = await prisma.user.findUnique({
          where: { iban: formatIban(sourceIban) },
          include: { wallet: true }
        });

        if (!sourceUser || !sourceUser.wallet) {
          logger.error(`Transfer failed: Source account not found (IBAN: ${sourceIban})`);
          throw new Error('Source account not found');
        }

        // Find destination user by IBAN
        const destUser = await prisma.user.findUnique({
          where: { iban: formatIban(destIban) },
          include: { wallet: true }
        });

        if (!destUser || !destUser.wallet) {
          logger.error(`Transfer failed: Destination account not found (IBAN: ${destIban})`);
          throw new Error('Destination account not found');
        }

        // Convert to our User type with balance
        const fromUser = {
          id: sourceUser.id,
          name: sourceUser.name,
          email: sourceUser.email,
          walletId: sourceUser.walletId,
          iban: sourceUser.iban || '',
          balance: Number(sourceUser.wallet.balance),
          createdAt: sourceUser.createdAt
        };

        const toUser = {
          id: destUser.id,
          name: destUser.name,
          email: destUser.email,
          walletId: destUser.walletId,
          iban: destUser.iban || '',
          balance: Number(destUser.wallet.balance),
          createdAt: destUser.createdAt
        };

        // Check if source has sufficient funds
        if (fromUser.balance < amount) {
          logger.error(`Transfer failed: Insufficient funds for ${fromUser.name} - Balance: PKR${fromUser.balance.toFixed(2)}, Required: PKR${amount.toFixed(2)}`);
          throw new Error('Insufficient funds');
        }

        // Use a transaction for atomic updates
        const result = await prisma.$transaction(async (tx) => {
          const newFromBalance = fromUser.balance - amount;
          const newToBalance = toUser.balance + amount;

          // Update source wallet
          await tx.wallet.update({
            where: { id: fromUser.walletId },
            data: { balance: newFromBalance },
          });

          // Update destination wallet
          await tx.wallet.update({
            where: { id: toUser.walletId },
            data: { balance: newToBalance },
          });

          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              fromWalletId: fromUser.walletId,
              toWalletId: toUser.walletId,
              amount,
              status: 'COMPLETED',
              description: `Transfer from ${fromUser.name} to ${toUser.name}`,
              type: 'TRANSFER',
            },
          });

          return {
            id: transaction.id,
            fromWalletId: transaction.fromWalletId,
            toWalletId: transaction.toWalletId,
            amount: Number(transaction.amount),
            timestamp: transaction.timestamp,
            status: transaction.status as 'COMPLETED' | 'FAILED' | 'PENDING',
            description: transaction.description,
            type: transaction.type as 'DEPOSIT' | 'TRANSFER',
          };
        });


        return result;
      } catch (error) {
        logger.error(`Database error during transfer: ${error}`);
        throw new Error(`Transfer failed: ${error}`);
      }
    },
    
    updateWalletIdByIBAN: async (_: any, { iban, walletId }: { iban: string; walletId: string }): Promise<User> => {
      logger.user(`Mutation: updateWalletIdByIBAN - Updating wallet ID for IBAN: ${iban} to ${walletId}`);
      
      try {
        const user = await updateWalletIdByIBAN(iban, walletId);
        
        if (!user) {
          logger.error(`Update failed: User with IBAN ${iban} not found`);
          throw new Error('User with the specified IBAN not found');
        }
        
        logger.success(`Wallet ID updated successfully for user ${user.name}`);
        return user;
      } catch (error) {
        logger.error(`Failed to update wallet ID by IBAN: ${error}`);
        throw new Error(`Failed to update wallet ID: ${error}`);
      }
    },
  },
};
