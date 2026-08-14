-- DropForeignKey
ALTER TABLE "training_criteria_groups" DROP CONSTRAINT "training_criteria_groups_positionId_fkey";

-- DropForeignKey
ALTER TABLE "training_logs" DROP CONSTRAINT "training_logs_positionId_fkey";

-- DropIndex
DROP INDEX "training_criteria_groups_positionId_order_idx";

-- AlterTable
ALTER TABLE "training_criteria_groups" DROP COLUMN "positionId",
ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "training_logs" DROP COLUMN "positionId",
ADD COLUMN     "departmentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "training_criteria_groups_departmentId_order_idx" ON "training_criteria_groups"("departmentId", "order");

-- AddForeignKey
ALTER TABLE "training_criteria_groups" ADD CONSTRAINT "training_criteria_groups_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

