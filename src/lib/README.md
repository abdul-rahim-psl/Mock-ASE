# Lib Directory Documentation

This document provides an overview of the files in the `lib` directory of the Mock Account Servicing Entity (Mock-ASE) application, including their purpose and the functions they contain.

## Table of Contents

1. [apollo-client.ts](#apollo-clientts)
2. [data-postgres.ts](#data-postgrests)
3. [logger.ts](#loggerts)
4. [prisma.ts](#prismats)
5. [queries.ts](#queriests)
6. [resolvers-postgres.ts](#resolvers-postgrests)
7. [schema.ts](#schemats)
8. [utils.ts](#utilsts)

## apollo-client.ts

**Purpose**: Sets up the Apollo Client for GraphQL operations in the frontend.

### Functions:

- **apolloClient (export)**: Configures and exports an Apollo Client instance with:
  - HTTP link pointing to the local GraphQL API endpoint
  - In-memory cache configuration
  - Error handling policies for queries and subscriptions

## data-postgres.ts

**Purpose**: Provides data access functions for interacting with the PostgreSQL database via Prisma ORM.

### Types:

- **User**: Defines the structure of a user object with id, name, email, walletId, balance, and createdAt.
- **Transaction**: Defines the structure of a transaction with id, fromWalletId, toWalletId, amount, timestamp, status, description, and type.

### Functions:

- **generateWalletId()**: Creates a unique wallet ID using UUID.
- **findUserById(id)**: Retrieves a user from the database by their ID.
- **findUserByWalletId(walletId)**: Finds a user by their wallet ID.
- **updateUserBalance(userId, newBalance)**: Updates a user's wallet balance.
- **addTransaction(transaction)**: Creates a new transaction record.
- **getUserTransactions(userId)**: Gets all transactions associated with a user.
- **getWalletTransactions(walletId)**: Retrieves transactions for a specific wallet.
- **getTotalSystemBalance()**: Calculates the sum of all wallet balances in the system.

## logger.ts

**Purpose**: Provides a centralized logging utility with formatted output, different log levels, and domain-specific loggers.

### Configuration:

- **config**: Contains settings for log verbosity, timestamp display, sequential numbering, and enabled log levels.
- **emojis**: Maps log types to emojis for visual distinction.
- **colors**: ANSI color codes for console output.

### Functions:

- **formatLog(level, message)**: Formats a log message with timestamp, log number, level, and styling.
- **log(level, message, ...args)**: Core logging function that handles different log levels.
- **logger.info()**: Logs informational messages.
- **logger.warn()**: Logs warning messages.
- **logger.error()**: Logs error messages.
- **logger.debug()**: Logs debug messages.
- **logger.api()**: Logs API-related messages.
- **logger.success()**: Logs success messages.
- **logger.user()**: Logs user-related operations.
- **logger.wallet()**: Logs wallet-related operations.
- **logger.transfer()**: Logs money transfer operations.
- **logger.configure(newConfig)**: Updates the logger configuration.
- **logger.resetCounter()**: Resets the sequential log counter.

## prisma.ts

**Purpose**: Initializes and exports the Prisma client for database interactions.

### Features:

- Creates a singleton Prisma client instance
- Prevents multiple instances in development using Node.js global scope
- Configures logging for queries, errors, and warnings
- Exports the client for use throughout the application

## queries.ts

**Purpose**: Defines GraphQL queries and mutations using the gql tag from Apollo Client.

### Queries:

- **GET_USERS**: Fetches all users with their details.
- **GET_USER**: Retrieves a single user by ID.
- **GET_USER_BY_WALLET_ID**: Finds a user by their wallet ID.
- **GET_TRANSACTIONS**: Gets all transactions.
- **GET_USER_TRANSACTIONS**: Fetches transactions for a specific user.
- **GET_WALLET_TRANSACTIONS**: Gets transactions for a specific wallet.
- **GET_TOTAL_SYSTEM_BALANCE**: Retrieves the sum of all balances in the system.

### Mutations:

- **CREATE_USER**: Creates a new user with name and email.
- **DEPOSIT_MONEY**: Adds funds to a user's wallet.
- **TRANSFER_MONEY**: Transfers money between wallets.

## resolvers-postgres.ts

**Purpose**: Implements GraphQL resolvers that handle query and mutation operations by interacting with the database.

### Query Resolvers:

- **getUsers()**: Retrieves all users from the database.
- **getUser(id)**: Fetches a single user by ID.
- **getUserByWalletId(walletId)**: Finds a user by their wallet ID.
- **getTransactions()**: Gets all transaction records.
- **getUserTransactions(userId)**: Fetches transactions for a specific user.
- **getWalletTransactions(walletId)**: Gets transactions for a specific wallet.
- **getTotalSystemBalance()**: Calculates the total balance across all wallets.

### Mutation Resolvers:

- **createUser(name, email)**: Creates a new user with an associated wallet.
- **depositMoney(userId, amount)**: Adds funds to a user's wallet and records the transaction.
- **transferMoney(fromWalletId, toWalletId, amount)**: Transfers money between wallets, updating balances and creating a transaction record.

## schema.ts

**Purpose**: Defines the GraphQL schema with type definitions.

### Type Definitions:

- **User**: Structure of user data for GraphQL operations.
- **Transaction**: Structure of transaction data.
- **TransactionStatus**: Enum for transaction status (COMPLETED, FAILED, PENDING).
- **TransactionType**: Enum for transaction types (DEPOSIT, TRANSFER).
- **Query**: Available query operations.
- **Mutation**: Available mutation operations.

## utils.ts

**Purpose**: Provides utility functions used throughout the application.

### Functions:

- **cn(...inputs)**: Merges Tailwind CSS classes using clsx and tailwind-merge.
- **formatCurrency(amount)**: Formats a number as USD currency.
- **formatDate(dateString)**: Formats date strings into a readable format with error handling.
- **formatWalletId(walletId)**: Shortens wallet IDs for display by truncating with ellipsis if too long.
