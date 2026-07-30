-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "checkInLat" DOUBLE PRECISION,
ADD COLUMN     "checkInLng" DOUBLE PRECISION,
ADD COLUMN     "checkInWifiBssid" TEXT,
ADD COLUMN     "checkInWifiSsid" TEXT,
ADD COLUMN     "shiftId" TEXT;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

