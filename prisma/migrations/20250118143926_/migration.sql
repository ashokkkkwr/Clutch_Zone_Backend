/*
  Warnings:

  - You are about to drop the column `data` on the `Bracket` table. All the data in the column will be lost.
  - Added the required column `totalPlayers` to the `Bracket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Bracket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimum_player` to the `tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bracket" DROP COLUMN "data",
ADD COLUMN     "totalPlayers" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tournament" ADD COLUMN     "minimum_player" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
