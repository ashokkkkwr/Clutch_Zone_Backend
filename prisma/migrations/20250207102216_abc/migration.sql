/*
  Warnings:

  - You are about to drop the `tournament_registration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tournament_registration" DROP CONSTRAINT "tournament_registration_game_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_registration" DROP CONSTRAINT "tournament_registration_team_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_registration" DROP CONSTRAINT "tournament_registration_tournament_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_registration" DROP CONSTRAINT "tournament_registration_user_id_fkey";

-- DropTable
DROP TABLE "tournament_registration";
