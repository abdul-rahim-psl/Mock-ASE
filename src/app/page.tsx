'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS, GET_TRANSACTIONS, GET_TOTAL_SYSTEM_BALANCE } from '@/lib/queries';
import { Header } from '@/components/Header';
import { UserList } from '@/components/UserList';
import { UserDetails } from '@/components/UserDetails';
import { TransactionFeed } from '@/components/TransactionFeed';
import { CreateUserForm } from '@/components/CreateUserForm';
import { TransferForm } from '@/components/TransferForm';

export default function Dashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'users' | 'transactions' | 'transfer' | 'create-user'>('users');
  
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_USERS);
  
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS);

  const { data: balanceData, refetch: refetchBalance } = useQuery(GET_TOTAL_SYSTEM_BALANCE);

  const users = usersData?.getUsers || [];
  const transactions = transactionsData?.getTransactions || [];
  const totalBalance = balanceData?.getTotalSystemBalance || 0;

  // Implement debounced refresh to prevent multiple rapid API calls
  const [refreshPending, setRefreshPending] = useState(false);
  
  // This function schedules a refresh rather than executing it immediately
  const scheduleRefresh = useCallback(() => {
    setRefreshPending(true);
  }, []);
  
  // Actual refresh function that performs the API calls
  const performRefresh = useCallback(() => {
    refetchUsers();
    refetchTransactions();
    refetchBalance();
    setRefreshPending(false);
  }, [refetchUsers, refetchTransactions, refetchBalance]);
  
  // Debounced refresh effect - will only refresh after 300ms of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (refreshPending) {
      timeoutId = setTimeout(() => {
        performRefresh();
      }, 300); // 300ms debounce
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshPending, performRefresh]);
  
  // Auto-refresh data periodically (every 30 seconds instead of 3-5 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      scheduleRefresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [scheduleRefresh]);
  
  // Expose the scheduled refresh function as handleRefresh for components to use
  const handleRefresh = scheduleRefresh;

  const selectedUser = selectedUserId ? users.find((user: any) => user.id === selectedUserId) : null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header 
        totalBalance={totalBalance}
        onRefresh={handleRefresh}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - User List */}
        <div className="w-1/3 bg-[var(--card-bg)] border-r border-[var(--card-border)] overflow-hidden">
          <UserList
            users={users}
            loading={usersLoading}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-hidden bg-[var(--background)]">
          {activeView === 'users' && selectedUser && (
            <UserDetails
              user={selectedUser}
              onUserUpdate={handleRefresh}
            />
          )}
          
          {activeView === 'users' && !selectedUser && (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2 text-[var(--text-heading)]">Select a User</h3>
                <p className="text-[var(--text-body)]">Choose a user from the list to view their details and manage their account.</p>
              </div>
            </div>
          )}

          {activeView === 'transactions' && (
            <TransactionFeed
              transactions={transactions}
              loading={transactionsLoading}
              users={users}
            />
          )}

          {activeView === 'transfer' && (
            <TransferForm
              users={users}
              onTransferComplete={handleRefresh}
            />
          )}

          {activeView === 'create-user' && (
            <CreateUserForm
              onUserCreated={() => {
                handleRefresh();
                setActiveView('users');
              }}
            />
          )}
        </div>

        {/* Right Panel - Recent Activity */}
        <div className="w-80 bg-[var(--card-bg)] border-l border-[var(--card-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--card-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-heading)]">Recent Activity</h2>
          </div>
          <div className="h-full overflow-y-auto">
            <TransactionFeed
              transactions={transactions.slice(0, 10)}
              loading={transactionsLoading}
              users={users}
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
