-- Add IBAN field to users table
ALTER TABLE "users" ADD COLUMN "iban" TEXT UNIQUE;
