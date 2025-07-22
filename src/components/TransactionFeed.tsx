'use client';

import { formatCurrency, formatDate, formatWalletId } from '@/lib/utils';
import { Activity, Loader2, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';

interface Transaction {
  id: string;
  fromWalletId?: string;
  toWalletId: string;
  amount: number;
  timestamp: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  description: string;
  type: 'DEPOSIT' | 'TRANSFER';
}

interface User {
  id: string;
  name: string;
  email: string;
  walletId: string;
  balance: number;
  createdAt: string;
}

interface TransactionFeedProps {
  transactions: Transaction[];
  loading: boolean;
  users: User[];
  compact?: boolean;
}

export function TransactionFeed({ transactions, loading, users, compact = false }: TransactionFeedProps) {
  const getUserByWalletId = (walletId: string) => {
    return users.find(user => user.walletId === walletId);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'DEPOSIT') {
      return <Plus className="h-4 w-4 text-green-600" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-4'} ${compact ? 'p-2' : 'p-6'}`}>
      {!compact && (
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Transaction Feed</h2>
        </div>
      )}

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const fromUser = transaction.fromWalletId ? getUserByWalletId(transaction.fromWalletId) : null;
          const toUser = getUserByWalletId(transaction.toWalletId);

          return (
            <div
              key={transaction.id}
              className={`${compact ? 'p-3' : 'p-4'} bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-900`}>
                      {transaction.description}
                    </p>
                    
                    {!compact && (
                      <div className="mt-1 space-y-1">
                        {transaction.type === 'TRANSFER' && fromUser && toUser && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{fromUser.name}</span>
                            <ArrowUpRight className="h-3 w-3 inline mx-1" />
                            <span className="font-medium">{toUser.name}</span>
                          </p>
                        )}
                        
                        {transaction.type === 'DEPOSIT' && toUser && (
                          <p className="text-sm text-gray-600">
                            Deposit to <span className="font-medium">{toUser.name}</span>
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {transaction.fromWalletId && (
                            <span>From: {formatWalletId(transaction.fromWalletId)}</span>
                          )}
                          <span>To: {formatWalletId(transaction.toWalletId)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-green-600`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.type}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!compact && transactions.length >= 10 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Showing latest {transactions.length} transactions
          </p>
        </div>
      )}
    </div>
  );
}
