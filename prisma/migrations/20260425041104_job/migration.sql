/*
  Warnings:

  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER', 'REJECTED', 'ACCEPTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('MANUAL', 'GMAIL_AUTO');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropTable
DROP TABLE "Application";

-- DropEnum
DROP TYPE "ApplicationSource";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedDate" TIMESTAMP(3),
    "source" "JobSource" NOT NULL DEFAULT 'MANUAL',
    "emailThreadId" TEXT,
    "emailMessageId" TEXT,
    "emailSubject" TEXT,
    "notes" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_userId_idx" ON "Job"("userId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_source_idx" ON "Job"("source");

-- CreateIndex
CREATE INDEX "Job_emailThreadId_idx" ON "Job"("emailThreadId");

-- CreateIndex
CREATE INDEX "Job_deletedAt_idx" ON "Job"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_userId_emailMessageId_key" ON "Job"("userId", "emailMessageId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
