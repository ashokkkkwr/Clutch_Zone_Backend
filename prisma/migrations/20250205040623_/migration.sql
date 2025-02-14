/*
  Warnings:

  - Added the required column `member` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "member" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_member_fkey" FOREIGN KEY ("member") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
