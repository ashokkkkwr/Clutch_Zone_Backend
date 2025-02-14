/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `team_players` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "team_players_user_id_key" ON "team_players"("user_id");
