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
CREATE TABLE "teamPlayers" (
    "id" SERIAL NOT NULL,
    "role" "TeamPlayerRole" NOT NULL DEFAULT 'PLAYER',
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "teamPlayers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teamPlayers_user_id_key" ON "teamPlayers"("user_id");

-- AddForeignKey
ALTER TABLE "teamPlayers" ADD CONSTRAINT "teamPlayers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamPlayers" ADD CONSTRAINT "teamPlayers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
