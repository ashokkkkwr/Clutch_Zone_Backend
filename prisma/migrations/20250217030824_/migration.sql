/*
  Warnings:

  - Changed the type of `bonus` on the `payment_bucks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payment_bucks" DROP COLUMN "bonus",
ADD COLUMN     "bonus" INTEGER NOT NULL;
