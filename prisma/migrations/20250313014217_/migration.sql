-- CreateTable
CREATE TABLE "game_favaurites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "game_favaurites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_favaurites" ADD CONSTRAINT "game_favaurites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_favaurites" ADD CONSTRAINT "game_favaurites_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
