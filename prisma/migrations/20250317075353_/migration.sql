-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "points1" INTEGER,
ADD COLUMN     "points2" INTEGER;

-- AlterTable
ALTER TABLE "tournament" ADD COLUMN     "is_points_based" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "total_rounds" INTEGER;
