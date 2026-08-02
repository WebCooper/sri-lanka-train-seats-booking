/*
  Warnings:

  - Added the required column `coach_class` to the `coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seat_configuration` to the `coach` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coach" ADD COLUMN     "coach_class" TEXT NOT NULL,
ADD COLUMN     "seat_configuration" TEXT NOT NULL;
