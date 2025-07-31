'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { DEPOSIT_MONEY, GET_USER_TRANSACTIONS } from '@/lib/queries';
import { formatCurrency, formatDate, formatWalletId } from '@/lib/utils';
import { Wallet, Plus, History, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  walletId: string;
  iban?: string;
  balance: number;
  createdAt: string;
}

interface UserDetailsProps {
  user: User;
  onUserUpdate: () => void;
}

export function UserDetails({ user, onUserUpdate }: UserDetailsProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: transactionsData, loading: transactionsLoading } = useQuery(GET_USER_TRANSACTIONS, {
    variables: { userId: user.id },
    pollInterval: 3000,
  });

  const [depositMoney] = useMutation(DEPOSIT_MONEY);

  const transactions = transactionsData?.getUserTransactions || [];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than 0' });
      return;
    }

    setDepositLoading(true);
    setMessage(null);

    try {
      await depositMoney({
        variables: {
          userId: user.id,
          amount: amount,
        },
      });

      setMessage({ type: 'success', text: `Successfully deposited ${formatCurrency(amount)}` });
      setDepositAmount('');
      onUserUpdate();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to deposit money' 
      });
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* User Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{user.walletId}</span>
            </div>
            {user.iban && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-semibold text-gray-500">IBAN:</span>
                <span className="text-sm text-gray-500">{user.iban}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{formatCurrency(user.balance)}</p>
            <p className="text-sm text-gray-500">Current Balance</p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Account created: {formatDate(user.createdAt)}
        </div>
      </div>

      {/* Deposit Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deposit Money</h2>
        
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Deposit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-14 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={depositLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={depositLoading || !depositAmount}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {depositLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{depositLoading ? 'Processing...' : 'Deposit Money'}</span>
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6">
        <div className="flex items-center space-x-2 mb-4">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>

        {transactionsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No transactions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    <span>Type: {transaction.type}</span>
                    <span>Status: {transaction.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.fromWalletId === user.walletId ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.fromWalletId === user.walletId ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.fromWalletId && transaction.fromWalletId !== user.walletId && (
                    <p className="text-xs text-gray-500">From: {formatWalletId(transaction.fromWalletId)}</p>
                  )}
                  {transaction.toWalletId !== user.walletId && (
                    <p className="text-xs text-gray-500">To: {formatWalletId(transaction.toWalletId)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
