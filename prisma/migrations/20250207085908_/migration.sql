/*
  Warnings:

  - The `role` column on the `teamPlayers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `team_leader_id` on the `teams` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TeamPlayerRole" AS ENUM ('PLAYER', 'TEAM_LEADER');

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_team_leader_id_fkey";

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "team1Id" INTEGER,
ADD COLUMN     "team2Id" INTEGER,
ADD COLUMN     "winnerTeamId" INTEGER;

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "teamPlayers" DROP COLUMN "role",
ADD COLUMN     "role" "TeamPlayerRole" NOT NULL DEFAULT 'PLAYER';

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "team_leader_id";

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
