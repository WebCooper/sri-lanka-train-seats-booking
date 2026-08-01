/*
  Warnings:

  - A unique constraint covering the columns `[nic_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "nic_number" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "seat_hold" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "origin_station_id" TEXT NOT NULL,
    "destination_station_id" TEXT NOT NULL,
    "user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seat_hold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "booking_reference" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "origin_station_id" TEXT NOT NULL,
    "destination_station_id" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "passenger_email" TEXT NOT NULL,
    "passenger_phone" TEXT,
    "user_id" TEXT,
    "fare_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seat_hold_schedule_id_coach_id_seat_number_idx" ON "seat_hold"("schedule_id", "coach_id", "seat_number");

-- CreateIndex
CREATE UNIQUE INDEX "booking_booking_reference_key" ON "booking"("booking_reference");

-- CreateIndex
CREATE INDEX "booking_schedule_id_coach_id_seat_number_idx" ON "booking"("schedule_id", "coach_id", "seat_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_nic_number_key" ON "user"("nic_number");

-- AddForeignKey
ALTER TABLE "seat_hold" ADD CONSTRAINT "seat_hold_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold" ADD CONSTRAINT "seat_hold_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold" ADD CONSTRAINT "seat_hold_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold" ADD CONSTRAINT "seat_hold_destination_station_id_fkey" FOREIGN KEY ("destination_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold" ADD CONSTRAINT "seat_hold_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_destination_station_id_fkey" FOREIGN KEY ("destination_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
