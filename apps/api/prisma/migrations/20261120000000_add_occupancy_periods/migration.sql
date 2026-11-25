-- CreateTable
CREATE TABLE "OccupancyPeriod" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "tenantNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OccupancyPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OccupancyPeriod_apartmentId_idx" ON "OccupancyPeriod"("apartmentId");

-- CreateIndex
CREATE INDEX "OccupancyPeriod_startDate_endDate_idx" ON "OccupancyPeriod"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "OccupancyPeriod" ADD CONSTRAINT "OccupancyPeriod_apartmentId_fkey"
  FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Set default for availabilityStatus on existing rows (column already exists, just ensure default)
ALTER TABLE "Apartment" ALTER COLUMN "availabilityStatus" SET DEFAULT 'Available';
