/*
  Warnings:

  - You are about to drop the `teamPlayers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "teamPlayers" DROP CONSTRAINT "teamPlayers_team_id_fkey";

-- DropForeignKey
ALTER TABLE "teamPlayers" DROP CONSTRAINT "teamPlayers_user_id_fkey";

-- DropTable
DROP TABLE "teamPlayers";

-- CreateTable
CREATE TABLE "TeamPlayers" (
    "id" SERIAL NOT NULL,
    "role" "TeamPlayerRole" NOT NULL DEFAULT 'PLAYER',
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "TeamPlayers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayers_user_id_key" ON "TeamPlayers"("user_id");

-- AddForeignKey
ALTER TABLE "TeamPlayers" ADD CONSTRAINT "TeamPlayers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayers" ADD CONSTRAINT "TeamPlayers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
