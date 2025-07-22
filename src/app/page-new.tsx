'use client';

import { useState } from 'react';
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
  
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_USERS, {
    pollInterval: 5000, // Poll every 5 seconds for real-time updates
  });
  
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS, {
    pollInterval: 3000, // Poll every 3 seconds for real-time updates
  });
  
  const { data: balanceData, refetch: refetchBalance } = useQuery(GET_TOTAL_SYSTEM_BALANCE, {
    pollInterval: 5000,
  });

  const users = usersData?.getUsers || [];
  const transactions = transactionsData?.getTransactions || [];
  const totalBalance = balanceData?.getTotalSystemBalance || 0;

  const handleRefresh = () => {
    refetchUsers();
    refetchTransactions();
    refetchBalance();
  };

  const selectedUser = selectedUserId ? users.find((user: any) => user.id === selectedUserId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalBalance={totalBalance}
        onRefresh={handleRefresh}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - User List */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-hidden">
          <UserList
            users={users}
            loading={usersLoading}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            onRefresh={refetchUsers}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'users' && selectedUser && (
            <UserDetails
              user={selectedUser}
              onUserUpdate={handleRefresh}
            />
          )}
          
          {activeView === 'users' && !selectedUser && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a User</h3>
                <p>Choose a user from the list to view their details and manage their account.</p>
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
        <div className="w-80 bg-white border-l border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
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
