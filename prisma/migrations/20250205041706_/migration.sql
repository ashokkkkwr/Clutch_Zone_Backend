/*
  Warnings:

  - You are about to drop the column `member` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `team_leader` on the `teams` table. All the data in the column will be lost.
  - Added the required column `team_leader_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_member_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_team_leader_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "member",
DROP COLUMN "team_leader",
ADD COLUMN     "member_id" INTEGER,
ADD COLUMN     "team_leader_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_leader_id_fkey" FOREIGN KEY ("team_leader_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
