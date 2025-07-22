import { gql } from '@apollo/client';

// Queries
export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      name
      email
      walletId
      balance
      createdAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      email
      walletId
      balance
      createdAt
    }
  }
`;

export const GET_USER_BY_WALLET_ID = gql`
  query GetUserByWalletId($walletId: String!) {
    getUserByWalletId(walletId: $walletId) {
      id
      name
      email
      walletId
      balance
      createdAt
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    getTransactions {
      id
      fromWalletId
      toWalletId
      amount
      timestamp
      status
      description
      type
    }
  }
`;

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($userId: ID!) {
    getUserTransactions(userId: $userId) {
      id
      fromWalletId
      toWalletId
      amount
      timestamp
      status
      description
      type
    }
  }
`;

export const GET_WALLET_TRANSACTIONS = gql`
  query GetWalletTransactions($walletId: String!) {
    getWalletTransactions(walletId: $walletId) {
      id
      fromWalletId
      toWalletId
      amount
      timestamp
      status
      description
      type
    }
  }
`;

export const GET_TOTAL_SYSTEM_BALANCE = gql`
  query GetTotalSystemBalance {
    getTotalSystemBalance
  }
`;

// Mutations
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
      walletId
      balance
      createdAt
    }
  }
`;

export const DEPOSIT_MONEY = gql`
  mutation DepositMoney($userId: ID!, $amount: Float!) {
    depositMoney(userId: $userId, amount: $amount) {
      id
      name
      email
      walletId
      balance
      createdAt
    }
  }
`;

export const TRANSFER_MONEY = gql`
  mutation TransferMoney($fromWalletId: String!, $toWalletId: String!, $amount: Float!) {
    transferMoney(fromWalletId: $fromWalletId, toWalletId: $toWalletId, amount: $amount) {
      id
      fromWalletId
      toWalletId
      amount
      timestamp
      status
      description
      type
    }
  }
`;
