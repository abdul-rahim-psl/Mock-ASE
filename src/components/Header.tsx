'use client';

import { formatCurrency } from '@/lib/utils';
import { RefreshCw, Users, ArrowUpDown, Plus, Activity } from 'lucide-react';

interface HeaderProps {
  totalBalance: number;
  onRefresh: () => void;
  activeView: 'users' | 'transactions' | 'transfer' | 'create-user';
  onViewChange: (view: 'users' | 'transactions' | 'transfer' | 'create-user') => void;
}

export function Header({ totalBalance, onRefresh, activeView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-gray-900">
            Mock Account Servicing Entity
          </div>
          <div className="text-sm text-gray-500">
            Total System Balance: {formatCurrency(totalBalance)}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange('users')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'users'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </button>

          <button
            onClick={() => onViewChange('transactions')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'transactions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => onViewChange('transfer')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'transfer'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => onViewChange('create-user')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'create-user'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </nav>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
