/*
  Warnings:

  - You are about to drop the column `member_id` on the `teams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_member_id_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "member_id";
