import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { logger } from './logger';

// Type definitions aligned with Prisma schema
export type User = {
  id: string;
  name: string;
  email: string;
  walletId: string;
  balance: number;
  createdAt: Date | string;
};

export type Transaction = {
  id: string;
  fromWalletId?: string | null;
  toWalletId: string;
  amount: number;
  timestamp: Date | string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  description: string;
  type: 'DEPOSIT' | 'TRANSFER';
};

// Helper function to generate a new wallet ID
export const generateWalletId = (): string => {
  return `wallet-${uuidv4().substring(0, 8)}`;
};

// User operations
export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      walletId: user.walletId,
      balance: Number(user.wallet.balance),
      createdAt: user.createdAt,
    };
  } catch (error) {
    logger.error(`Database error finding user by ID: ${error}`);
    return null;
  }
};

export const findUserByWalletId = async (walletId: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { walletId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      walletId: user.walletId,
      balance: Number(user.wallet.balance),
      createdAt: user.createdAt,
    };
  } catch (error) {
    logger.error(`Database error finding user by wallet ID: ${error}`);
    return null;
  }
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) return null;

    await prisma.wallet.update({
      where: { id: user.walletId },
      data: { balance: newBalance },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      walletId: user.walletId,
      balance: newBalance,
      createdAt: user.createdAt,
    };
  } catch (error) {
    logger.error(`Database error updating balance: ${error}`);
    return null;
  }
};

// Transaction operations
export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'timestamp'>
): Promise<Transaction> => {
  try {
    const newTransaction = await prisma.transaction.create({
      data: {
        fromWalletId: transaction.fromWalletId || null,
        toWalletId: transaction.toWalletId,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        type: transaction.type,
      },
    });

    return {
      id: newTransaction.id,
      fromWalletId: newTransaction.fromWalletId,
      toWalletId: newTransaction.toWalletId,
      amount: Number(newTransaction.amount),
      timestamp: newTransaction.timestamp,
      status: newTransaction.status as 'COMPLETED' | 'FAILED' | 'PENDING',
      description: newTransaction.description,
      type: newTransaction.type as 'DEPOSIT' | 'TRANSFER',
    };
  } catch (error) {
    logger.error(`Database error creating transaction: ${error}`);
    throw new Error(`Failed to create transaction: ${error}`);
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletId: true },
    });

    if (!user) return [];

    return getWalletTransactions(user.walletId);
  } catch (error) {
    logger.error(`Database error getting user transactions: ${error}`);
    return [];
  }
};

export const getWalletTransactions = async (walletId: string): Promise<Transaction[]> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromWalletId: walletId },
          { toWalletId: walletId },
        ],
      },
      orderBy: { timestamp: 'desc' },
    });

    return transactions.map((tx: { id: any; fromWalletId: any; toWalletId: any; amount: any; timestamp: any; status: string; description: any; type: string; }) => ({
      id: tx.id,
      fromWalletId: tx.fromWalletId,
      toWalletId: tx.toWalletId,
      amount: Number(tx.amount),
      timestamp: tx.timestamp,
      status: tx.status as 'COMPLETED' | 'FAILED' | 'PENDING',
      description: tx.description,
      type: tx.type as 'DEPOSIT' | 'TRANSFER',
    }));
  } catch (error) {
    logger.error(`Database error getting wallet transactions: ${error}`);
    return [];
  }
};

export const getTotalSystemBalance = async (): Promise<number> => {
  try {
    const result = await prisma.wallet.aggregate({
      _sum: { balance: true },
    });
    
    return Number(result._sum.balance || 0);
  } catch (error) {
    logger.error(`Database error calculating total balance: ${error}`);
    return 0;
  }
};
