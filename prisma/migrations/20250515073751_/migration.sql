-- DropForeignKey
ALTER TABLE "TeamPlayers" DROP CONSTRAINT "TeamPlayers_team_id_fkey";

-- AddForeignKey
ALTER TABLE "TeamPlayers" ADD CONSTRAINT "TeamPlayers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
