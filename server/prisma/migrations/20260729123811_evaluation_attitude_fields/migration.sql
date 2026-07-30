-- AlterTable
ALTER TABLE "evaluation_forms" ADD COLUMN     "disciplinaryReportCount" INTEGER,
ADD COLUMN     "lateMinutesInMonth" INTEGER,
ADD COLUMN     "missedCheckInOutCount" INTEGER,
ADD COLUMN     "shiftChangeCount" INTEGER,
ADD COLUMN     "shiftsWorkedInMonth" INTEGER;

