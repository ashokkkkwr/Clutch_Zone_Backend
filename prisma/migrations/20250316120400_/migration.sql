-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "player1_score" INTEGER,
ADD COLUMN     "player2_score" INTEGER,
ADD COLUMN     "score_submitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "screenshot" TEXT,
ADD COLUMN     "team1_score" INTEGER,
ADD COLUMN     "team2_score" INTEGER;
