import { v4 as uuidv4 } from 'uuid';
import { 
  users, 
  transactions, 
  User, 
  Transaction, 
  generateWalletId,
  findUserById,
  findUserByWalletId,
  updateUserBalance,
  addTransaction,
  getUserTransactions,
  getWalletTransactions,
  getTotalSystemBalance
} from './data';
import { logger } from './logger';

export const resolvers = {
  Query: {
    getUsers: (): User[] => {
      logger.user(`Query: getUsers - Fetching all users (count: ${users.length})`);
      return users;
    },
    
    getUser: (_: any, { id }: { id: string }): User | null => {
      const user = findUserById(id);
      logger.user(`Query: getUser - Fetching user by ID: ${id} - ${user ? 'Found' : 'Not found'}`);
      return user || null;
    },
    
    getUserByWalletId: (_: any, { walletId }: { walletId: string }): User | null => {
      const user = findUserByWalletId(walletId);
      logger.wallet(`Query: getUserByWalletId - Fetching user by wallet ID: ${walletId} - ${user ? 'Found' : 'Not found'}`);
      return user || null;
    },
    
    getTransactions: (): Transaction[] => {
      logger.transfer(`Query: getTransactions - Fetching all transactions (count: ${transactions.length})`);
      return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getUserTransactions: (_: any, { userId }: { userId: string }): Transaction[] => {
      const userTransactions = getUserTransactions(userId);
      logger.transfer(`Query: getUserTransactions - Fetching transactions for user ID: ${userId} (count: ${userTransactions.length})`);
      return userTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getWalletTransactions: (_: any, { walletId }: { walletId: string }): Transaction[] => {
      const walletTransactions = getWalletTransactions(walletId);
      logger.transfer(`Query: getWalletTransactions - Fetching transactions for wallet ID: ${walletId} (count: ${walletTransactions.length})`);
      return walletTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getTotalSystemBalance: (): number => {
      const balance = getTotalSystemBalance();
      logger.wallet(`Query: getTotalSystemBalance - Current system balance: $${balance.toFixed(2)}`);
      return balance;
    },
  },

  Mutation: {
    createUser: (_: any, { name, email }: { name: string; email: string }): User => {
      logger.user(`Mutation: createUser - Creating new user: ${name} (${email})`);
      
      // Check if email already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        logger.error(`Failed to create user: Email ${email} already exists`);
        throw new Error('User with this email already exists');
      }

      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        walletId: generateWalletId(),
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      logger.success(`User created successfully: ${name} (ID: ${newUser.id}, Wallet: ${newUser.walletId})`);
      return newUser;
    },

    depositMoney: (_: any, { userId, amount }: { userId: string; amount: number }): User => {
      logger.wallet(`Mutation: depositMoney - Depositing $${amount.toFixed(2)} to user ID: ${userId}`);
      
      if (amount <= 0) {
        logger.error(`Deposit failed: Amount must be greater than zero (received: ${amount})`);
        throw new Error('Deposit amount must be greater than zero');
      }

      const user = findUserById(userId);
      if (!user) {
        logger.error(`Deposit failed: User not found with ID: ${userId}`);
        throw new Error('User not found');
      }

      const newBalance = user.balance + amount;
      const updatedUser = updateUserBalance(userId, newBalance);
      
      if (!updatedUser) {
        logger.error(`Deposit failed: Could not update balance for user ID: ${userId}`);
        throw new Error('Failed to update user balance');
      }

      // Add transaction record
      const transaction = addTransaction({
        toWalletId: user.walletId,
        amount,
        status: 'COMPLETED',
        description: `Deposit to ${user.name}'s wallet`,
        type: 'DEPOSIT',
      });

      logger.success(`Deposit successful: $${amount.toFixed(2)} to ${user.name}'s wallet (ID: ${transaction.id})`);
      logger.wallet(`New balance for ${user.name}: $${newBalance.toFixed(2)}`);
      
      return updatedUser;
    },

    transferMoney: (_: any, { fromWalletId, toWalletId, amount }: { 
      fromWalletId: string; 
      toWalletId: string; 
      amount: number 
    }): Transaction => {
      logger.transfer(`Mutation: transferMoney - Transfer request: $${amount.toFixed(2)} from ${fromWalletId} to ${toWalletId}`);
      
      if (amount <= 0) {
        logger.error(`Transfer failed: Amount must be greater than zero (received: ${amount})`);
        throw new Error('Transfer amount must be greater than zero');
      }

      if (fromWalletId === toWalletId) {
        logger.error(`Transfer failed: Cannot transfer to the same wallet (${fromWalletId})`);
        throw new Error('Cannot transfer to the same wallet');
      }

      const fromUser = findUserByWalletId(fromWalletId);
      const toUser = findUserByWalletId(toWalletId);

      if (!fromUser) {
        logger.error(`Transfer failed: Source wallet not found (${fromWalletId})`);
        throw new Error('Source wallet not found');
      }

      if (!toUser) {
        logger.error(`Transfer failed: Destination wallet not found (${toWalletId})`);
        throw new Error('Destination wallet not found');
      }

      if (fromUser.balance < amount) {
        logger.error(`Transfer failed: Insufficient funds for ${fromUser.name} - Balance: $${fromUser.balance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
        throw new Error('Insufficient funds');
      }

      // Update balances
      const newFromBalance = fromUser.balance - amount;
      const newToBalance = toUser.balance + amount;

      const updatedFromUser = updateUserBalance(fromUser.id, newFromBalance);
      const updatedToUser = updateUserBalance(toUser.id, newToBalance);

      if (!updatedFromUser || !updatedToUser) {
        logger.error(`Transfer failed: Database update error when updating balances`);
        throw new Error('Failed to update balances');
      }

      // Add transaction record
      const transaction = addTransaction({
        fromWalletId,
        toWalletId,
        amount,
        status: 'COMPLETED',
        description: `Transfer from ${fromUser.name} to ${toUser.name}`,
        type: 'TRANSFER',
      });

      logger.success(`Transfer completed: $${amount.toFixed(2)} from ${fromUser.name} to ${toUser.name} (ID: ${transaction.id})`);
      logger.wallet(`New balance for ${fromUser.name}: $${newFromBalance.toFixed(2)}`);
      logger.wallet(`New balance for ${toUser.name}: $${newToBalance.toFixed(2)}`);

      return transaction;
    },
  },
};
