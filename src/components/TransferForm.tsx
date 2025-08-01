'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { TRANSFER_MONEY } from '@/lib/queries';
import { formatCurrency, formatWalletId } from '@/lib/utils';
import { ArrowUpDown, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  walletId: string;
  balance: number;
  createdAt: string;
}

interface TransferFormProps {
  users: User[];
  onTransferComplete: () => void;
}

export function TransferForm({ users, onTransferComplete }: TransferFormProps) {
  const [formData, setFormData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '100',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const [transferMoney] = useMutation(TRANSFER_MONEY);

  const filteredFromUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchFrom.toLowerCase()) ||
    user.email.toLowerCase().includes(searchFrom.toLowerCase()) ||
    user.walletId.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredToUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTo.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTo.toLowerCase()) ||
    user.walletId.toLowerCase().includes(searchTo.toLowerCase())
  );

  const fromUser = users.find(user => user.walletId === formData.fromWalletId);
  const toUser = users.find(user => user.walletId === formData.toWalletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (!formData.fromWalletId || !formData.toWalletId) {
      setMessage({ type: 'error', text: 'Please select both source and destination wallets' });
      return;
    }

    if (formData.fromWalletId === formData.toWalletId) {
      setMessage({ type: 'error', text: 'Cannot transfer to the same wallet' });
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than 0' });
      return;
    }

    if (fromUser && fromUser.balance < amount) {
      setMessage({ 
        type: 'error', 
        text: `Insufficient funds. Available balance: ${formatCurrency(fromUser.balance)}` 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await transferMoney({
        variables: {
          fromWalletId: formData.fromWalletId,
          toWalletId: formData.toWalletId,
          amount: amount,
        },
      });

      setMessage({ 
        type: 'success', 
        text: `Successfully transferred ${formatCurrency(amount)} from ${fromUser?.name} to ${toUser?.name}` 
      });
      setFormData({ fromWalletId: '', toWalletId: '', amount: '' });
      setSearchFrom('');
      setSearchTo('');
      onTransferComplete();
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message + 'faillllllll' : 'Failed to transfer money' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <ArrowUpDown className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Money</h1>
          <p className="text-gray-600">
            Transfer funds between user wallets instantly.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Wallet
                </label>
                
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <select
                  value={formData.fromWalletId}
                  onChange={(e) => handleInputChange('fromWalletId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Select source wallet</option>
                  {filteredFromUsers.map((user) => (
                    <option key={user.id} value={user.walletId}>
                      {user.name} - {formatCurrency(user.balance)} ({formatWalletId(user.walletId)})
                    </option>
                  ))}
                </select>

                {fromUser && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">{fromUser.name}</p>
                    <p className="text-sm text-gray-600">{fromUser.email}</p>
                    <p className="text-sm font-medium text-green-600">
                      Available: {formatCurrency(fromUser.balance)}
                    </p>
                  </div>
                )}
              </div>

              {/* To Wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Wallet
                </label>
                
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <select
                  value={formData.toWalletId}
                  onChange={(e) => handleInputChange('toWalletId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Select destination wallet</option>
                  {filteredToUsers
                    .filter(user => user.walletId !== formData.fromWalletId)
                    .map((user) => (
                    <option key={user.id} value={user.walletId}>
                      {user.name} - {formatCurrency(user.balance)} ({formatWalletId(user.walletId)})
                    </option>
                  ))}
                </select>

                {toUser && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">{toUser.name}</p>
                    <p className="text-sm text-gray-600">{toUser.email}</p>
                    <p className="text-sm font-medium text-green-600">
                      Current: {formatCurrency(toUser.balance)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  step="1"
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Transfer Summary */}
            {fromUser && toUser && formData.amount && !isNaN(parseFloat(formData.amount)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Transfer Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">From:</span>
                    <span className="font-medium text-blue-900">{fromUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">To:</span>
                    <span className="font-medium text-blue-900">{toUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">New balance ({fromUser.name}):</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(fromUser.balance - parseFloat(formData.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">New balance ({toUser.name}):</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(toUser.balance + parseFloat(formData.amount))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-md flex items-center space-x-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.fromWalletId || !formData.toWalletId || !formData.amount}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUpDown className="h-5 w-5" />
              )}
              <span>{loading ? 'Processing Transfer...' : 'Transfer Money'}</span>
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Transfer Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Transfers are processed instantly</li>
            <li>• Both accounts will be updated immediately</li>
            <li>• A transaction record will be created for both users</li>
            <li>• Ensure the source account has sufficient funds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
