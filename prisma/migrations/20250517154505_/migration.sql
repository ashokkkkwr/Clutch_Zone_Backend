-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_gearId_fkey";

-- DropForeignKey
ALTER TABLE "gear_purchase" DROP CONSTRAINT "gear_purchase_gear_id_fkey";

-- DropForeignKey
ALTER TABLE "gear_transaction" DROP CONSTRAINT "gear_transaction_gear_id_fkey";

-- AddForeignKey
ALTER TABLE "gear_purchase" ADD CONSTRAINT "gear_purchase_gear_id_fkey" FOREIGN KEY ("gear_id") REFERENCES "gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_transaction" ADD CONSTRAINT "gear_transaction_gear_id_fkey" FOREIGN KEY ("gear_id") REFERENCES "gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
