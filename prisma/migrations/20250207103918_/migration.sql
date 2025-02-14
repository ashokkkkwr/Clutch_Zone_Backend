-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_userId_fkey";

-- AlterTable
ALTER TABLE "participants" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
