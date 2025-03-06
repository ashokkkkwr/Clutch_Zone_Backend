/*
  Warnings:

  - You are about to drop the column `cBucks` on the `payment_bucks` table. All the data in the column will be lost.
  - Added the required column `bonus` to the `payment_bucks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buckImage` to the `payment_bucks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `payment_bucks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_bucks" DROP COLUMN "cBucks",
ADD COLUMN     "bonus" TEXT NOT NULL,
ADD COLUMN     "buckImage" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;
