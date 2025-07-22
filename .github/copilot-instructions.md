# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a Mock Account Servicing Entity - a simplified bank teller system built with:
- **Frontend**: Next.js 15 with TypeScript, App Router, Tailwind CSS
- **Backend**: GraphQL API with Apollo Server
- **Data**: In-memory storage (for MVP)

## Architecture Overview
- **Pages**: Admin dashboard, user management, transaction views
- **Components**: Reusable UI components for banking operations
- **GraphQL**: Type-safe API for user management, wallets, and transactions
- **Data Models**: User (with wallet) and Transaction entities

## Key Features
1. **User Management**: Create users with auto-generated wallet IDs
2. **Wallet System**: Deposit money and manage balances
3. **Transfer System**: Move money between wallets instantly
4. **Transaction Logging**: Real-time transaction history and feeds

## Code Conventions
- Use TypeScript for all files
- Follow Next.js App Router patterns
- Use Tailwind CSS for styling with proper responsive design
- Implement proper error handling and loading states
- Use consistent naming for GraphQL operations
- Follow banking/financial terminology in variable names

## GraphQL Schema Guidelines
- Use clear, descriptive names for queries and mutations
- Include proper error handling in resolvers
- Return appropriate data structures for UI consumption
- Maintain transaction integrity in money transfers

## UI/UX Guidelines
- Design for bank teller/admin use (not customer-facing)
- Use clear, professional styling appropriate for financial systems
- Include proper feedback for all operations (success/error states)
- Ensure real-time updates for balances and transactions
- Use consistent spacing and typography throughout
