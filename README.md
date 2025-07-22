# Mock Account Servicing Entity

A simplified bank teller system built with Next.js, TypeScript, Tailwind CSS, and GraphQL for managing customer accounts, deposits, and transfers.

## 🚀 Features

### User Management Dashboard
- **Create New Users**: Simple form with name, email, and auto-generated unique wallet ID
- **User List View**: Table showing all users with their basic info and wallet balances  
- **User Details**: Click on any user to see their full profile and transaction history

### Wallet System
- **Auto-Generated Wallet URLs**: Each user gets a unique wallet identifier (like `wallet-abc123`)
- **Deposit Interface**: Add money to any user's wallet (like loading a gift card)
- **Wallet Balance Display**: Real-time balance updates across the interface

### Money Transfer System
- **Transfer Form**: Send money from one wallet to another using wallet IDs
- **Instant Processing**: Transfers happen immediately (like internal bank transfers)
- **Success/Error Feedback**: Clear confirmation messages

### Transaction Logging
- **Global Transaction Feed**: Live stream of all transfers happening in the system
- **Per-User History**: Individual transaction logs for each wallet
- **Transaction Details**: Amount, sender, receiver, timestamp, and status

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript, App Router
- **Styling**: Tailwind CSS
- **GraphQL**: Apollo Client & Apollo Server
- **Icons**: Lucide React
- **Data Storage**: In-memory (for MVP)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000` (or the port shown in terminal)

## 📱 Usage Guide

### Admin Dashboard Layout
- **Header**: System title, navigation tabs, and total system balance
- **Left Panel**: User list with search/filter functionality
- **Main Area**: Selected user details, transfer form, or transaction logs
- **Right Panel**: Recent activity feed and quick stats

### Creating Users (Like opening bank accounts)
1. Click "Add User" button in the header
2. Fill in name and email
3. System auto-generates unique wallet ID
4. User appears in dashboard with $0 balance

### Managing Money (Like a bank teller)
1. Select user from list
2. Click "Deposit" and enter amount
3. Balance updates immediately
4. Transaction logged automatically

### Processing Transfers (Like wire transfers)
1. Go to "Transfer" tab
2. Select source wallet from dropdown
3. Select destination wallet from dropdown
4. Enter transfer amount
5. Click "Transfer" - money moves instantly
6. Both users' balances update
7. Transaction appears in logs

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📊 GraphQL API

### Queries
- `getUsers` - Fetch all users
- `getUser(id)` - Get specific user details
- `getUserByWalletId(walletId)` - Find user by wallet ID
- `getTransactions` - Global transaction history
- `getUserTransactions(userId)` - User-specific transactions
- `getWalletTransactions(walletId)` - Wallet-specific transactions
- `getTotalSystemBalance` - Total money in the system

### Mutations
- `createUser(name, email)` - Create new user with auto-generated wallet
- `depositMoney(userId, amount)` - Add money to wallet
- `transferMoney(fromWalletId, toWalletId, amount)` - Transfer between wallets

---

**Note**: This is a mock system for demonstration purposes only. Do not use for actual financial transactions.
# Mock-ASE
