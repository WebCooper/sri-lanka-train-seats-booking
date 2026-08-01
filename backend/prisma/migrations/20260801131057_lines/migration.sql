-- CreateTable
CREATE TABLE "station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_station_id" TEXT NOT NULL,
    "end_station_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_station" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "distance_from_start" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "line_station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "seat_count" INTEGER NOT NULL,
    "is_reserved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "train_number" TEXT NOT NULL,
    "line_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "train_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_coach" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "train_coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "station_code_key" ON "station"("code");

-- CreateIndex
CREATE UNIQUE INDEX "line_station_line_id_position_key" ON "line_station"("line_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "coach_identifier_key" ON "coach"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "train_train_number_key" ON "train"("train_number");

-- CreateIndex
CREATE UNIQUE INDEX "train_coach_train_id_position_key" ON "train_coach"("train_id", "position");

-- AddForeignKey
ALTER TABLE "line" ADD CONSTRAINT "line_start_station_id_fkey" FOREIGN KEY ("start_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line" ADD CONSTRAINT "line_end_station_id_fkey" FOREIGN KEY ("end_station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_station" ADD CONSTRAINT "line_station_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_station" ADD CONSTRAINT "line_station_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train" ADD CONSTRAINT "train_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_coach" ADD CONSTRAINT "train_coach_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "train"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_coach" ADD CONSTRAINT "train_coach_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "train"("id") ON DELETE CASCADE ON UPDATE CASCADE;
