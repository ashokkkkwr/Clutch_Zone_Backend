-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_member_fkey";

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "member" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_member_fkey" FOREIGN KEY ("member") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
