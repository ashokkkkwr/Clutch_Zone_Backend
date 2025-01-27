-- DropForeignKey
ALTER TABLE "Bracket" DROP CONSTRAINT "Bracket_user_id_fkey";

-- AlterTable
ALTER TABLE "Bracket" ALTER COLUMN "totalPlayers" SET DEFAULT 0,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
