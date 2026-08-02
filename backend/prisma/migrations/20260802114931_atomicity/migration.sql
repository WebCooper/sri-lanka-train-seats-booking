/*
  Warnings:

  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seat_hold` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_coach_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_destination_station_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_origin_station_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_hold" DROP CONSTRAINT "seat_hold_coach_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_hold" DROP CONSTRAINT "seat_hold_destination_station_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_hold" DROP CONSTRAINT "seat_hold_origin_station_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_hold" DROP CONSTRAINT "seat_hold_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_hold" DROP CONSTRAINT "seat_hold_user_id_fkey";

-- DropTable
DROP TABLE "booking";

-- DropTable
DROP TABLE "seat_hold";

-- CreateTable
CREATE TABLE "seat_segment_allocation" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "origin_station_id" TEXT NOT NULL,
    "destination_station_id" TEXT NOT NULL,
    "origin_position" INTEGER NOT NULL,
    "destination_position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "booking_reference" TEXT,
    "passenger_name" TEXT,
    "passenger_email" TEXT,
    "passenger_phone" TEXT,
    "user_id" TEXT,
    "fare_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_segment_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_segment_allocation_booking_reference_key" ON "seat_segment_allocation"("booking_reference");

-- CreateIndex
CREATE INDEX "seat_segment_allocation_schedule_id_coach_id_seat_number_idx" ON "seat_segment_allocation"("schedule_id", "coach_id", "seat_number");

-- CreateIndex
CREATE INDEX "seat_segment_allocation_status_idx" ON "seat_segment_allocation"("status");

-- AddForeignKey
ALTER TABLE "seat_segment_allocation" ADD CONSTRAINT "seat_segment_allocation_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_segment_allocation" ADD CONSTRAINT "seat_segment_allocation_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_segment_allocation" ADD CONSTRAINT "seat_segment_allocation_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_segment_allocation" ADD CONSTRAINT "seat_segment_allocation_destination_station_id_fkey" FOREIGN KEY ("destination_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_segment_allocation" ADD CONSTRAINT "seat_segment_allocation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
