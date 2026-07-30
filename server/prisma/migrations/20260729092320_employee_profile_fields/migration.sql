-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "hireDate" DATE,
ADD COLUMN     "idIssueDate" DATE,
ADD COLUMN     "idIssuePlace" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "permanentAddress" TEXT;

