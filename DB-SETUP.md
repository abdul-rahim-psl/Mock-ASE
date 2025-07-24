# PostgreSQL Database Setup for Mock-ASE

This document provides instructions for setting up the PostgreSQL database for the Mock Account Servicing Entity application.

## Prerequisites

1. PostgreSQL installed and running on your system or accessible via a connection string
2. Node.js and npm installed

## Setup Instructions

### 1. Configure Database Connection

Update the `.env` file with your PostgreSQL connection details:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mock_ase?schema=public"
```

Replace `username` and `password` with your PostgreSQL credentials.

### 2. Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE mock_ase;

# Exit PostgreSQL
\q
```

### 3. Run Database Migrations

```bash
# Generate and apply migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Verify Setup

```bash
# Start the application
npm run dev
```

Visit http://localhost:3000 to ensure the application is working with PostgreSQL.

## Database Schema

The application uses the following schema:

- **Users**: Stores user information (name, email)
- **Wallets**: Stores wallet information associated with users (balance)
- **Transactions**: Stores all financial transactions (deposits, transfers)

## Development Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Reset the database (caution: deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## Troubleshooting

If you encounter connection issues:

1. Verify PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Check connection details in `.env` file

3. Ensure your PostgreSQL user has appropriate permissions:
   ```sql
   ALTER USER your_username WITH SUPERUSER;
   ```
