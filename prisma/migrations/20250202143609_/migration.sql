-- AlterTable
ALTER TABLE "tournament" ADD COLUMN     "winnerId" INTEGER;

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
