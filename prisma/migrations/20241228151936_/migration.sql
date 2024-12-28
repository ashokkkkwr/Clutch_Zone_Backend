/*
  Warnings:

  - You are about to drop the column `duration` on the `top_up_option` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `top_up_option` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "top_up_option" DROP COLUMN "duration",
DROP COLUMN "is_active",
ADD COLUMN     "amount" INTEGER;
