-- CreateTable
CREATE TABLE "fare_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "flat_booking_fee" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "rate_per_km" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "off_peak_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fare_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_class_fare_multiplier" (
    "id" TEXT NOT NULL,
    "coach_class" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "coach_class_fare_multiplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peak_hour_rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    "days_of_week" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peak_hour_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_class_fare_multiplier_coach_class_key" ON "coach_class_fare_multiplier"("coach_class");
