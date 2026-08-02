-- =============================================================================
-- DBeaver: create seat_segment_allocation + GiST exclusion for atomic segments
-- Run against your Train Booking PostgreSQL database.
--
-- Segment positions (origin_position, destination_position) are written by the
-- NestJS API using line-segment.util — not computed in the database.
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS "seat_segment_allocation" (
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

CREATE INDEX IF NOT EXISTS seat_segment_allocation_schedule_coach_seat_idx
    ON seat_segment_allocation (schedule_id, coach_id, seat_number);

CREATE INDEX IF NOT EXISTS seat_segment_allocation_status_idx
    ON seat_segment_allocation (status);

-- Reject overlapping half-open segments [origin, destination) on the same seat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'seat_segment_allocation_no_overlap'
    ) THEN
        ALTER TABLE seat_segment_allocation
        ADD CONSTRAINT seat_segment_allocation_no_overlap
        EXCLUDE USING gist (
            schedule_id WITH =,
            coach_id WITH =,
            seat_number WITH =,
            int4range(origin_position, destination_position, '[)') WITH &&
        )
        WHERE (status IN ('ACTIVE', 'CONFIRMED'));
    END IF;
END $$;

COMMIT;

-- Optional verification:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'seat_segment_allocation'::regclass AND contype = 'x';
