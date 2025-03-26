/*
  Warnings:

  - Made the column `tournament_start_date_number` on table `tournament` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tournament_end_date_number` on table `tournament` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tournament" ALTER COLUMN "tournament_start_date_number" SET NOT NULL,
ALTER COLUMN "tournament_end_date_number" SET NOT NULL;
