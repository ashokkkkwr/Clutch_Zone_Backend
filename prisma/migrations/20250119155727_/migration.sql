/*
  Warnings:

  - You are about to drop the column `user_id` on the `teams` table. All the data in the column will be lost.
  - Added the required column `team_leader` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUDO_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_user_id_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "user_id",
ADD COLUMN     "team_leader" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_leader_fkey" FOREIGN KEY ("team_leader") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
