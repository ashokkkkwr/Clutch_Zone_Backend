/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `gear` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tournament" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Bracket" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_tournamentId_key" ON "Bracket"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "gear_name_key" ON "gear"("name");

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
