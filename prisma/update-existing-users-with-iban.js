// Script to update existing users with IBAN values
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to generate a new IBAN
const generateIBAN = () => {
  // Format: PK93 ABPA 0000 0011 2345 6702
  // PK93 ABPA remains constant, generate 12 random digits for the rest
  const generateRandomDigits = (length) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  };
  
  // Format the IBAN with spaces every 4 characters
  const digits = generateRandomDigits(12);
  return `PK93 ABPA ${digits.substring(0, 4)} ${digits.substring(4, 8)} ${digits.substring(8, 12)}`;
};

async function main() {
  // Get all users who don't have an IBAN yet
  const usersWithoutIban = await prisma.user.findMany({
    where: {
      iban: null
    }
  });
  
  console.log(`Found ${usersWithoutIban.length} users without IBAN`);
  
  // Update each user with a unique IBAN
  for (const user of usersWithoutIban) {
    const iban = generateIBAN();
    await prisma.user.update({
      where: { id: user.id },
      data: { iban }
    });
    console.log(`Updated user ${user.name} with IBAN: ${iban}`);
  }
  
  console.log('All users updated successfully with IBAN values.');
}

main()
  .catch(e => {
    console.error('Error updating users with IBAN values:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
