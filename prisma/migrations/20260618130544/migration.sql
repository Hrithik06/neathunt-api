/*
  Warnings:

  - You are about to alter the column `company` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `title` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `url` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "company" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "url" SET DATA TYPE VARCHAR(500);
