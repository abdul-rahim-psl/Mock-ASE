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
    <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-[var(--text-heading)]">
            Mock ABL
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            Total System Balance: {formatCurrency(totalBalance)}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange('users')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'users'
                ? 'bg-blue-500/20 text-blue-400 dark:text-blue-300'
                : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--button-hover)]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </button>

          <button
            onClick={() => onViewChange('transactions')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'transactions'
                ? 'bg-blue-500/20 text-blue-400 dark:text-blue-300'
                : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--button-hover)]'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => onViewChange('transfer')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'transfer'
                ? 'bg-blue-500/20 text-blue-400 dark:text-blue-300'
                : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--button-hover)]'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => onViewChange('create-user')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'create-user'
                ? 'bg-green-500/20 text-green-400 dark:text-green-300'
                : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--button-hover)]'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </nav>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--button-hover)] rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
