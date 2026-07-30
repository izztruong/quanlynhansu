-- DropIndex
DROP INDEX "attendance_employeeId_date_key";

-- CreateIndex
CREATE INDEX "attendance_employeeId_date_idx" ON "attendance"("employeeId", "date");

