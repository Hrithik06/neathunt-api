/*
  Warnings:

  - You are about to drop the column `scopes` on the `User` table. All the data in the column will be lost.
  - Added the required column `gmailConnected` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmailReconnectRequired` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "scopes",
ADD COLUMN     "gmailConnected" BOOLEAN NOT NULL,
ADD COLUMN     "gmailConnectedAt" TIMESTAMP(3),
ADD COLUMN     "gmailLastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "gmailReconnectRequired" BOOLEAN NOT NULL,
ADD COLUMN     "googleScopes" TEXT[];
