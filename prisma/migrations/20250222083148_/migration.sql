/*
  Warnings:

  - The `tournament_start_date_number` column on the `tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tournament_end_date_number` column on the `tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `tournament_registration_start_date` on the `tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tournament_registration_end_date` on the `tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tournament_start_date` on the `tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tournament_end_date` on the `tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tournament" DROP COLUMN "tournament_registration_start_date",
ADD COLUMN     "tournament_registration_start_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tournament_registration_end_date",
ADD COLUMN     "tournament_registration_end_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tournament_start_date",
ADD COLUMN     "tournament_start_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tournament_end_date",
ADD COLUMN     "tournament_end_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tournament_start_date_number",
ADD COLUMN     "tournament_start_date_number" TIMESTAMP(3),
DROP COLUMN "tournament_end_date_number",
ADD COLUMN     "tournament_end_date_number" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "clutch_bucks" INTEGER NOT NULL DEFAULT 0;
