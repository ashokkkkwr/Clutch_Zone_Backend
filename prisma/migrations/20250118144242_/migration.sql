/*
  Warnings:

  - You are about to drop the column `minimum_player` on the `tournament` table. All the data in the column will be lost.
  - Added the required column `total_player` to the `tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tournament" DROP COLUMN "minimum_player",
ADD COLUMN     "total_player" INTEGER NOT NULL;
