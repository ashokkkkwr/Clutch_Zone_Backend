-- DropForeignKey
ALTER TABLE "Bracket" DROP CONSTRAINT "Bracket_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamPlayers" DROP CONSTRAINT "TeamPlayers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "game_favaurites" DROP CONSTRAINT "game_favaurites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "gear_purchase" DROP CONSTRAINT "gear_purchase_user_id_fkey";

-- DropForeignKey
ALTER TABLE "gear_transaction" DROP CONSTRAINT "gear_transaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_player1Id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_player2Id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_userId_fkey";

-- DropForeignKey
ALTER TABLE "payment_bucks_transaction" DROP CONSTRAINT "payment_bucks_transaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team_join_requests" DROP CONSTRAINT "team_join_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team_media" DROP CONSTRAINT "team_media_user_id_fkey";

-- DropForeignKey
ALTER TABLE "top_up_transaction" DROP CONSTRAINT "top_up_transaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament" DROP CONSTRAINT "tournament_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_user_id_fkey";

-- DropForeignKey
ALTER TABLE "withdraw_request" DROP CONSTRAINT "withdraw_request_user_id_fkey";

-- AddForeignKey
ALTER TABLE "team_media" ADD CONSTRAINT "team_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayers" ADD CONSTRAINT "TeamPlayers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_request" ADD CONSTRAINT "withdraw_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_purchase" ADD CONSTRAINT "gear_purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_up_transaction" ADD CONSTRAINT "top_up_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_transaction" ADD CONSTRAINT "gear_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_bucks_transaction" ADD CONSTRAINT "payment_bucks_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_favaurites" ADD CONSTRAINT "game_favaurites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
