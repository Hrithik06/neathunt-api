/*
  Warnings:

  - You are about to drop the column `gmailReconnectRequired` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "gmailReconnectRequired",
ALTER COLUMN "gmailConnected" SET DEFAULT false;
