import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { logger } from './logger';
import { PrismaClient } from '@prisma/client';

// Define types for the resolvers
type User = {
  id: string;
  name: string;
  email: string;
  walletId: string;
  balance: number;
  createdAt: string;
};

type Transaction = {
  id: string;
  fromWalletId?: string | null;
  toWalletId: string;
  amount: number;
  timestamp: string;
  status: string;
  description: string;
  type: string;
};

// Define types for Prisma results
type PrismaUser = {
  id: string;
  name: string;
  email: string;
  walletId: string;
  createdAt: Date;
  wallet?: PrismaWallet | null;
};

type PrismaWallet = {
  id: string;
  userId: string;
  balance: any; // We'll convert to Number when using
  user?: PrismaUser;
};

type PrismaTransaction = {
  id: string;
  fromWalletId: string | null;
  toWalletId: string;
  amount: any; // We'll convert to Number when using
  timestamp: Date;
  status: string;
  description: string;
  type: string;
  fromWallet?: PrismaWallet | null;
  toWallet?: PrismaWallet | null;
};

export const resolvers = {
  Query: {
    getUsers: async (): Promise<User[]> => {
      try {
        logger.user('Query: getUsers - Fetching all users');
      
        const users = await prisma.user.findMany({
          include: {
            wallet: true
          }
        });
        
        const formattedUsers = users.map((user: PrismaUser) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          walletId: user.walletId,
          balance: Number(user.wallet?.balance || 0),
          createdAt: user.createdAt.toISOString()
        }));
        
        logger.user(`Found ${users.length} users`);
        return formattedUsers;
      } catch (error) {
        logger.error(`Failed to get users: ${error}`);
        return [];
      }
    },
    
    getUser: async (_: any, { id }: { id: string }): Promise<User | null> => {
      try {
        logger.user(`Query: getUser - Fetching user with ID: ${id}`);
      
        const user = await prisma.user.findUnique({
          where: { id },
          include: { wallet: true }
        });
        
        if (!user) {
          logger.warn(`User not found: ${id}`);
          return null;
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          walletId: user.walletId,
          balance: Number(user.wallet?.balance || 0),
          createdAt: user.createdAt.toISOString()
        };
      } catch (error) {
        logger.error(`Failed to get user: ${error}`);
        return null;
      }
    },
    
    getUserByWalletId: async (_: any, { walletId }: { walletId: string }): Promise<User | null> => {
      try {
        logger.wallet(`Query: getUserByWalletId - Fetching user by wallet ID: ${walletId}`);
      
        const user = await prisma.user.findUnique({
          where: { walletId },
          include: { wallet: true }
        });
        
        if (!user) {
          logger.warn(`User not found for wallet: ${walletId}`);
          return null;
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          walletId: user.walletId,
          balance: Number(user.wallet?.balance || 0),
          createdAt: user.createdAt.toISOString()
        };
      } catch (error) {
        logger.error(`Failed to get user by wallet ID: ${error}`);
        return null;
      }
    },
    
    getTransactions: async (): Promise<Transaction[]> => {
      try {
        logger.transfer(`Query: getTransactions - Fetching all transactions`);
      
        const transactions = await prisma.transaction.findMany({
          orderBy: { timestamp: 'desc' },
          include: {
            fromWallet: true,
            toWallet: true
          }
        });
        
        logger.transfer(`Found ${transactions.length} transactions`);
        
        return transactions.map((tx: PrismaTransaction) => ({
          id: tx.id,
          fromWalletId: tx.fromWalletId,
          toWalletId: tx.toWalletId,
          amount: Number(tx.amount),
          timestamp: tx.timestamp.toISOString(),
          status: tx.status,
          description: tx.description,
          type: tx.type
        }));
      } catch (error) {
        logger.error(`Failed to get transactions: ${error}`);
        return [];
      }
    },
    
    getUserTransactions: async (_: any, { userId }: { userId: string }): Promise<Transaction[]> => {
      try {
        logger.transfer(`Query: getUserTransactions - Fetching transactions for user ID: ${userId}`);
      
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { walletId: true }
        });
        
        if (!user) {
          logger.warn(`User not found: ${userId}`);
          return [];
        }
        
        const walletId = user.walletId;
        
        const transactions = await prisma.transaction.findMany({
          where: {
            OR: [
              { fromWalletId: walletId },
              { toWalletId: walletId }
            ]
          },
          orderBy: { timestamp: 'desc' }
        });
        
        logger.transfer(`Found ${transactions.length} transactions for user ${userId}`);
        
        return transactions.map((tx: PrismaTransaction) => ({
          id: tx.id,
          fromWalletId: tx.fromWalletId,
          toWalletId: tx.toWalletId,
          amount: Number(tx.amount),
          timestamp: tx.timestamp.toISOString(),
          status: tx.status,
          description: tx.description,
          type: tx.type
        }));
      } catch (error) {
        logger.error(`Failed to get user transactions: ${error}`);
        return [];
      }
    },
    
    getWalletTransactions: async (_: any, { walletId }: { walletId: string }): Promise<Transaction[]> => {
      try {
        logger.transfer(`Query: getWalletTransactions - Fetching transactions for wallet ID: ${walletId}`);
      
        const transactions = await prisma.transaction.findMany({
          where: {
            OR: [
              { fromWalletId: walletId },
              { toWalletId: walletId }
            ]
          },
          orderBy: { timestamp: 'desc' }
        });
        
        logger.transfer(`Found ${transactions.length} transactions for wallet ${walletId}`);
        
        return transactions.map((tx: PrismaTransaction) => ({
          id: tx.id,
          fromWalletId: tx.fromWalletId,
          toWalletId: tx.toWalletId,
          amount: Number(tx.amount),
          timestamp: tx.timestamp.toISOString(),
          status: tx.status,
          description: tx.description,
          type: tx.type
        }));
      } catch (error) {
        logger.error(`Failed to get wallet transactions: ${error}`);
        return [];
      }
    },
    
    getTotalSystemBalance: async (): Promise<number> => {
      try {
        logger.wallet(`Query: getTotalSystemBalance - Calculating total system balance`);
      
        const result = await prisma.wallet.aggregate({
          _sum: {
            balance: true
          }
        });
        
        const totalBalance = Number(result._sum.balance || 0);
        logger.wallet(`Total system balance: $${totalBalance.toFixed(2)}`);
        return totalBalance;
      } catch (error) {
        logger.error(`Failed to calculate total system balance: ${error}`);
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

        // Generate wallet ID
        const walletId = `wallet-${uuidv4().substring(0, 8)}`;

        // Use transaction to ensure both user and wallet are created
        const result = await prisma.$transaction(async (prismaTransaction: PrismaClient) => {
          // Create user with wallet ID
          const user = await prismaTransaction.user.create({
            data: {
              name,
              email,
              walletId,
            },
          });

          // Create wallet for user
          const wallet = await prismaTransaction.wallet.create({
            data: {
              id: walletId,
              userId: user.id,
              balance: 0,
            },
          });

          return {
            ...user,
            wallet
          };
        });

        logger.success(`User created successfully: ${name} (ID: ${result.id}, Wallet: ${result.walletId})`);
        
        return {
          id: result.id,
          name: result.name,
          email: result.email,
          walletId: result.walletId,
          balance: 0,
          createdAt: result.createdAt.toISOString(),
        };
      } catch (error) {
        logger.error(`Database error creating user: ${error}`);
        throw new Error(`Failed to create user: ${error}`);
      }
    },

    depositMoney: async (_: any, { userId, amount }: { userId: string; amount: number }): Promise<User> => {
      logger.wallet(`Mutation: depositMoney - Depositing $${amount.toFixed(2)} to user ID: ${userId}`);
      
      if (amount <= 0) {
        logger.error(`Deposit failed: Amount must be greater than zero (received: ${amount})`);
        throw new Error('Deposit amount must be greater than zero');
      }

      try {
        // Find user with their wallet
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { wallet: true }
        });
        
        if (!user || !user.wallet) {
          logger.error(`Deposit failed: User not found with ID: ${userId}`);
          throw new Error('User not found');
        }

        // Use transaction to ensure atomicity
        return await prisma.$transaction(async (prismaTransaction: PrismaClient) => {
          // Calculate new balance
          const newBalance = Number(user.wallet.balance) + amount;
          
          // Update wallet balance
          const updatedWallet = await prismaTransaction.wallet.update({
            where: { id: user.walletId },
            data: { balance: newBalance },
          });
          
          // Create transaction record
          await prismaTransaction.transaction.create({
            data: {
              toWalletId: user.walletId,
              amount,
              status: 'COMPLETED',
              description: `Deposit to ${user.name}'s wallet`,
              type: 'DEPOSIT',
            },
          });
          
          logger.success(`Deposit successful: $${amount.toFixed(2)} to ${user.name}'s wallet`);
          logger.wallet(`New balance for ${user.name}: $${newBalance.toFixed(2)}`);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            walletId: user.walletId,
            balance: newBalance,
            createdAt: user.createdAt.toISOString(),
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
      logger.transfer(`Mutation: transferMoney - Transfer request: $${amount.toFixed(2)} from ${fromWalletId} to ${toWalletId}`);
      
      if (amount <= 0) {
        logger.error(`Transfer failed: Amount must be greater than zero (received: ${amount})`);
        throw new Error('Transfer amount must be greater than zero');
      }

      if (fromWalletId === toWalletId) {
        logger.error(`Transfer failed: Cannot transfer to the same wallet (${fromWalletId})`);
        throw new Error('Cannot transfer to the same wallet');
      }

      try {
        // Get source wallet with user
        const fromWallet = await prisma.wallet.findUnique({
          where: { id: fromWalletId },
          include: { user: true }
        });

        // Get destination wallet with user
        const toWallet = await prisma.wallet.findUnique({
          where: { id: toWalletId },
          include: { user: true }
        });

        if (!fromWallet || !fromWallet.user) {
          logger.error(`Transfer failed: Source wallet not found (${fromWalletId})`);
          throw new Error('Source wallet not found');
        }

        if (!toWallet || !toWallet.user) {
          logger.error(`Transfer failed: Destination wallet not found (${toWalletId})`);
          throw new Error('Destination wallet not found');
        }

        const fromBalance = Number(fromWallet.balance);
        if (fromBalance < amount) {
          logger.error(`Transfer failed: Insufficient funds for ${fromWallet.user.name} - Balance: $${fromBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
          throw new Error('Insufficient funds');
        }

        // Use a transaction for atomic updates
        const transaction = await prisma.$transaction(async (prismaTransaction: PrismaClient) => {
          // Calculate new balances
          const newFromBalance = fromBalance - amount;
          const newToBalance = Number(toWallet.balance) + amount;

          // Update source wallet
          await prismaTransaction.wallet.update({
            where: { id: fromWalletId },
            data: { balance: newFromBalance },
          });

          // Update destination wallet
          await prismaTransaction.wallet.update({
            where: { id: toWalletId },
            data: { balance: newToBalance },
          });

          // Create transaction record
          const txRecord = await prismaTransaction.transaction.create({
            data: {
              fromWalletId,
              toWalletId,
              amount,
              status: 'COMPLETED',
              description: `Transfer from ${fromWallet.user.name} to ${toWallet.user.name}`,
              type: 'TRANSFER',
            },
          });

          return txRecord;
        });

        logger.success(`Transfer completed: $${amount.toFixed(2)} from ${fromWallet.user.name} to ${toWallet.user.name} (ID: ${transaction.id})`);
        logger.wallet(`New balance for ${fromWallet.user.name}: $${(fromBalance - amount).toFixed(2)}`);
        logger.wallet(`New balance for ${toWallet.user.name}: $${(Number(toWallet.balance) + amount).toFixed(2)}`);

        return {
          id: transaction.id,
          fromWalletId,
          toWalletId,
          amount: Number(transaction.amount),
          timestamp: transaction.timestamp.toISOString(),
          status: transaction.status,
          description: transaction.description,
          type: transaction.type
        };
      } catch (error) {
        logger.error(`Database error during transfer: ${error}`);
        throw new Error(`Transfer failed: ${error}`);
      }
    },
  },
};
