'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, formatWalletId } from '@/lib/utils';
import { Search, RefreshCw, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  walletId: string;
  iban?: string;
  balance: number;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  loading: boolean;
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  onRefresh: () => void;
}

export function UserList({ users, loading, selectedUserId, onUserSelect, onRefresh }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.walletId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.iban && (searchTerm == '' || user.iban.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No users found matching your search.' : 'No users yet. Create your first user to get started.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUserId === user.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="font-semibold text-gray-500">Wallet Address:</span> {formatWalletId(user.walletId)}
                    </p>
                    {user.iban && (
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="font-semibold text-gray-500">IBAN:</span> {user.iban}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(user.balance)}</p>
                    <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Total: {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </div>
      </div>
    </div>
  );
}
