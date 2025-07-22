import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  walletId: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromWalletId?: string;
  toWalletId: string;
  amount: number;
  timestamp: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  description: string;
  type: 'DEPOSIT' | 'TRANSFER';
}

// In-memory storage for MVP
export const users: User[] = [];
export const transactions: Transaction[] = [];

// Helper functions
export const generateWalletId = (): string => {
  return `wallet-${uuidv4().substring(0, 8)}`;
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findUserByWalletId = (walletId: string): User | undefined => {
  return users.find(user => user.walletId === walletId);
};

export const updateUserBalance = (userId: string, newBalance: number): User | null => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex].balance = newBalance;
  return users[userIndex];
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  
  transactions.push(newTransaction);
  return newTransaction;
};

export const getUserTransactions = (userId: string): Transaction[] => {
  const user = findUserById(userId);
  if (!user) return [];
  
  return transactions.filter(
    tx => tx.fromWalletId === user.walletId || tx.toWalletId === user.walletId
  );
};

export const getWalletTransactions = (walletId: string): Transaction[] => {
  return transactions.filter(
    tx => tx.fromWalletId === walletId || tx.toWalletId === walletId
  );
};

export const getTotalSystemBalance = (): number => {
  return users.reduce((total, user) => total + user.balance, 0);
};
