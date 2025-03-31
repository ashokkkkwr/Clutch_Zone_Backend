/*
  Warnings:

  - You are about to drop the column `player1_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `player2_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `points1` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `screenshot` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `team1_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `team2_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `tournament_end_date_number` on the `tournament` table. All the data in the column will be lost.
  - You are about to drop the column `tournament_start_date_number` on the `tournament` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "player1_score",
DROP COLUMN "player2_score",
DROP COLUMN "points1",
DROP COLUMN "screenshot",
DROP COLUMN "team1_score",
DROP COLUMN "team2_score";

-- AlterTable
ALTER TABLE "tournament" DROP COLUMN "tournament_end_date_number",
DROP COLUMN "tournament_start_date_number";
