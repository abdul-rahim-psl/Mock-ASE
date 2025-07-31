import { gql } from '@apollo/client';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    walletId: String!
    iban: String
    balance: Float!
    createdAt: String!
  }

  type Transaction {
    id: ID!
    fromWalletId: String
    toWalletId: String!
    amount: Float!
    timestamp: String!
    status: TransactionStatus!
    description: String!
    type: TransactionType!
  }

  enum TransactionStatus {
    COMPLETED
    FAILED
    PENDING
  }

  enum TransactionType {
    DEPOSIT
    TRANSFER
  }

  type Query {
    getUsers: [User!]!
    getUser(id: ID!): User
    getUserByWalletId(walletId: String!): User
    getTransactions: [Transaction!]!
    getUserTransactions(userId: ID!): [Transaction!]!
    getWalletTransactions(walletId: String!): [Transaction!]!
    getTotalSystemBalance: Float!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    depositMoney(userId: ID!, amount: Float!): User!
    transferMoney(fromWalletId: String!, toWalletId: String!, amount: Float!): Transaction!
  }
`;
