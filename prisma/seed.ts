// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to generate wallet IDs
function generateWalletId(): string {
  return `wallet-${uuidv4().substring(0, 8)}`;
}

async function main() {
  console.log('Starting seeding...');

  try {
    // Clear any existing data
    await prisma.$transaction([
      prisma.transaction.deleteMany({}),
      prisma.wallet.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    // Create sample users with wallets
    const userCount = 5;
    const users = [];

    for (let i = 1; i <= userCount; i++) {
      const walletId = generateWalletId();
      const userId = uuidv4();

      // Create user
      const user = await prisma.user.create({
        data: {
          id: userId,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          walletId: walletId,
        },
      });

      // Create wallet for user
      const wallet = await prisma.wallet.create({
        data: {
          id: walletId,
          userId: user.id,
          balance: 1000.00, // Start with $1000 balance
        },
      });

      users.push({ ...user, wallet });
    }

    console.log(`Created ${users.length} users with wallets`);

    // Create some sample transactions
    const transactions = [];

    // Deposit transaction for user 1
    const depositTx = await prisma.transaction.create({
      data: {
        toWalletId: users[0].walletId,
        amount: 500.00,
        status: 'COMPLETED',
        description: `Initial deposit to ${users[0].name}'s wallet`,
        type: 'DEPOSIT',
      }
    });
    transactions.push(depositTx);

    // Update wallet balance after deposit
    await prisma.wallet.update({
      where: { id: users[0].walletId },
      data: { balance: 1500.00 }
    });

    // Transfer from user 1 to user 2
    const transferTx = await prisma.transaction.create({
      data: {
        fromWalletId: users[0].walletId,
        toWalletId: users[1].walletId,
        amount: 250.00,
        status: 'COMPLETED',
        description: `Transfer from ${users[0].name} to ${users[1].name}`,
        type: 'TRANSFER',
      }
    });
    transactions.push(transferTx);

    // Update wallet balances after transfer
    await prisma.wallet.update({
      where: { id: users[0].walletId },
      data: { balance: 1250.00 }
    });

    await prisma.wallet.update({
      where: { id: users[1].walletId },
      data: { balance: 1250.00 }
    });

    console.log(`Created ${transactions.length} sample transactions`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
