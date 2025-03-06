/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `teamPlayers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teamPlayers_user_id_key" ON "teamPlayers"("user_id");
