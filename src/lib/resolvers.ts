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

export const resolvers = {
  Query: {
    getUsers: (): User[] => {
      return users;
    },
    
    getUser: (_: any, { id }: { id: string }): User | null => {
      return findUserById(id) || null;
    },
    
    getUserByWalletId: (_: any, { walletId }: { walletId: string }): User | null => {
      return findUserByWalletId(walletId) || null;
    },
    
    getTransactions: (): Transaction[] => {
      return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getUserTransactions: (_: any, { userId }: { userId: string }): Transaction[] => {
      return getUserTransactions(userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getWalletTransactions: (_: any, { walletId }: { walletId: string }): Transaction[] => {
      return getWalletTransactions(walletId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getTotalSystemBalance: (): number => {
      return getTotalSystemBalance();
    },
  },

  Mutation: {
    createUser: (_: any, { name, email }: { name: string; email: string }): User => {
      // Check if email already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
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
      return newUser;
    },

    depositMoney: (_: any, { userId, amount }: { userId: string; amount: number }): User => {
      if (amount <= 0) {
        throw new Error('Deposit amount must be greater than zero');
      }

      const user = findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = user.balance + amount;
      const updatedUser = updateUserBalance(userId, newBalance);
      
      if (!updatedUser) {
        throw new Error('Failed to update user balance');
      }

      // Add transaction record
      addTransaction({
        toWalletId: user.walletId,
        amount,
        status: 'COMPLETED',
        description: `Deposit to ${user.name}'s wallet`,
        type: 'DEPOSIT',
      });

      return updatedUser;
    },

    transferMoney: (_: any, { fromWalletId, toWalletId, amount }: { 
      fromWalletId: string; 
      toWalletId: string; 
      amount: number 
    }): Transaction => {
      if (amount <= 0) {
        throw new Error('Transfer amount must be greater than zero');
      }

      if (fromWalletId === toWalletId) {
        throw new Error('Cannot transfer to the same wallet');
      }

      const fromUser = findUserByWalletId(fromWalletId);
      const toUser = findUserByWalletId(toWalletId);

      if (!fromUser) {
        throw new Error('Source wallet not found');
      }

      if (!toUser) {
        throw new Error('Destination wallet not found');
      }

      if (fromUser.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      const newFromBalance = fromUser.balance - amount;
      const newToBalance = toUser.balance + amount;

      const updatedFromUser = updateUserBalance(fromUser.id, newFromBalance);
      const updatedToUser = updateUserBalance(toUser.id, newToBalance);

      if (!updatedFromUser || !updatedToUser) {
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

      return transaction;
    },
  },
};
