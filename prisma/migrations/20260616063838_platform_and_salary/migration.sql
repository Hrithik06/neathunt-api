-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "currency" "Currency" DEFAULT 'INR',
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT 'LINKEDIN',
ADD COLUMN     "salary" TEXT DEFAULT '20-22LPA';
