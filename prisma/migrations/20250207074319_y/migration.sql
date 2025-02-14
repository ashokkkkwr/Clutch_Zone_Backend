/*
  Warnings:

  - You are about to drop the `time_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "time_slots" DROP CONSTRAINT "time_slots_tournament_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_registration" DROP CONSTRAINT "tournament_registration_time_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_result" DROP CONSTRAINT "tournament_result_time_slot_id_fkey";

-- DropTable
DROP TABLE "time_slots";
