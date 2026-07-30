-- CreateEnum
CREATE TYPE "EmployeeGroupScope" AS ENUM ('ALL', 'FULL_TIME', 'PART_TIME', 'SPECIFIC');

-- CreateEnum
CREATE TYPE "ContractStatusScope" AS ENUM ('ALL', 'OFFICIAL', 'PROBATION');

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "employeeTypeScope",
ADD COLUMN     "contractStatusScope" "ContractStatusScope" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "employeeGroupScope" "EmployeeGroupScope" NOT NULL DEFAULT 'ALL';

-- CreateTable
CREATE TABLE "notification_employees" (
    "notificationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "notification_employees_pkey" PRIMARY KEY ("notificationId","employeeId")
);

-- AddForeignKey
ALTER TABLE "notification_employees" ADD CONSTRAINT "notification_employees_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_employees" ADD CONSTRAINT "notification_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

