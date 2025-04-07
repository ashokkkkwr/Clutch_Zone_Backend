-- CreateTable
CREATE TABLE "team_media" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "media_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "team_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "team_media" ADD CONSTRAINT "team_media_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_media" ADD CONSTRAINT "team_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
