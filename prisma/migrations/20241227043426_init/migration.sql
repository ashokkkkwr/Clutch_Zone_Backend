-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "game_name" TEXT NOT NULL,
    "game_cover_image" TEXT,
    "game_icon" TEXT,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "in_game_id" (
    "id" SERIAL NOT NULL,
    "player_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "in_game_id_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "users" TEXT,
    "sender" INTEGER NOT NULL,
    "receiver" INTEGER NOT NULL,
    "links" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_pool" (
    "id" SERIAL NOT NULL,
    "prize" INTEGER NOT NULL,
    "placements" INTEGER NOT NULL,
    "tournament_id" INTEGER NOT NULL,

    CONSTRAINT "prize_pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "team_name" TEXT NOT NULL,
    "logo" TEXT,
    "max_players" INTEGER NOT NULL,
    "slug" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "tournaments_played" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" SERIAL NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "max_no_of_participants" INTEGER NOT NULL,
    "start_time_number" TEXT,
    "end_time_number" TEXT,
    "tournament_id" INTEGER NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_history" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,

    CONSTRAINT "tournament_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament" (
    "id" SERIAL NOT NULL,
    "tournament_name" TEXT NOT NULL,
    "tournament_icon" TEXT,
    "tournament_cover" TEXT,
    "tournament_description" TEXT NOT NULL,
    "tournament_entry_fee" DOUBLE PRECISION,
    "tournament_registration_start_date" TEXT NOT NULL,
    "tournament_registration_end_date" TEXT NOT NULL,
    "tournament_start_date" TEXT NOT NULL,
    "tournament_end_date" TEXT NOT NULL,
    "tournament_start_date_number" TEXT,
    "tournament_end_date_number" TEXT,
    "tournament_game_mode" TEXT NOT NULL,
    "tournament_streaming_link" TEXT,
    "featured_tournament" BOOLEAN NOT NULL DEFAULT false,
    "games_id" INTEGER NOT NULL,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_result" (
    "id" SERIAL NOT NULL,
    "placement" TEXT,
    "tournament_id" INTEGER NOT NULL,
    "time_slot_id" INTEGER NOT NULL,

    CONSTRAINT "tournament_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_registration" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "team_id" INTEGER,
    "game_id" INTEGER NOT NULL,
    "time_slot_id" INTEGER NOT NULL,

    CONSTRAINT "tournament_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdraw_request" (
    "id" SERIAL NOT NULL,
    "withdraw_amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT,
    "wallet_number" TEXT,
    "account_holder_name" TEXT,
    "account_number" TEXT,
    "bank_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "withdraw_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "google_id" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatar" TEXT NOT NULL DEFAULT 'uploads/avatar/avatar.png',
    "bio" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "tournaments_played" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gear" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gear_purchase" (
    "id" SERIAL NOT NULL,
    "gear_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gear_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_up_option" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "top_up_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_up_transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "top_up_option_id" INTEGER NOT NULL,
    "transaction_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "top_up_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet_id" INTEGER NOT NULL,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gear_transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "gear_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gear_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "in_game_id_user_id_key" ON "in_game_id"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_team_name_key" ON "teams"("team_name");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_user_id_key" ON "wallet"("user_id");

-- AddForeignKey
ALTER TABLE "in_game_id" ADD CONSTRAINT "in_game_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_game_id" ADD CONSTRAINT "in_game_id_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_sender_fkey" FOREIGN KEY ("sender") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_pool" ADD CONSTRAINT "prize_pool_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_history" ADD CONSTRAINT "tournament_history_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_games_id_fkey" FOREIGN KEY ("games_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_result" ADD CONSTRAINT "tournament_result_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_result" ADD CONSTRAINT "tournament_result_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registration" ADD CONSTRAINT "tournament_registration_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registration" ADD CONSTRAINT "tournament_registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registration" ADD CONSTRAINT "tournament_registration_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registration" ADD CONSTRAINT "tournament_registration_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registration" ADD CONSTRAINT "tournament_registration_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraw_request" ADD CONSTRAINT "withdraw_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_purchase" ADD CONSTRAINT "gear_purchase_gear_id_fkey" FOREIGN KEY ("gear_id") REFERENCES "gear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_purchase" ADD CONSTRAINT "gear_purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_up_transaction" ADD CONSTRAINT "top_up_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_up_transaction" ADD CONSTRAINT "top_up_transaction_top_up_option_id_fkey" FOREIGN KEY ("top_up_option_id") REFERENCES "top_up_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_transaction" ADD CONSTRAINT "gear_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gear_transaction" ADD CONSTRAINT "gear_transaction_gear_id_fkey" FOREIGN KEY ("gear_id") REFERENCES "gear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
