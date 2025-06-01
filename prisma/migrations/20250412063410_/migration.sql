-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedMatchId_fkey" FOREIGN KEY ("relatedMatchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
