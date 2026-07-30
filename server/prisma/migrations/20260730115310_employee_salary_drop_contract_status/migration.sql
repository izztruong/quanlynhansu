-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "salaryRate" INTEGER;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "contractStatusScope";

-- DropEnum
DROP TYPE "ContractStatusScope";

