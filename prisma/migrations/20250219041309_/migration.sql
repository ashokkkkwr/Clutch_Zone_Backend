/*
  Warnings:

  - You are about to drop the column `slug` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "slug",
ADD COLUMN     "description" TEXT;
