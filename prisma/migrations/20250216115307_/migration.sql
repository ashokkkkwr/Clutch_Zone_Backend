-- CreateTable
CREATE TABLE "payment_bucks" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "cBucks" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "payment_bucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_bucks_transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_bucks_id" INTEGER NOT NULL,

    CONSTRAINT "payment_bucks_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_bucks_transaction" ADD CONSTRAINT "payment_bucks_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_bucks_transaction" ADD CONSTRAINT "payment_bucks_transaction_payment_bucks_id_fkey" FOREIGN KEY ("payment_bucks_id") REFERENCES "payment_bucks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
