-- Evaluation forms move from a fixed schema to configurable criteria
-- (danh mục). Safe to drop/recreate directly: evaluation_forms and
-- evaluation_attachments were emptied of test data before this migration.

-- Drop old fixed columns on evaluation_forms
ALTER TABLE "evaluation_forms"
  DROP COLUMN "shiftsWorkedInMonth",
  DROP COLUMN "lateMinutesInMonth",
  DROP COLUMN "shiftChangeCount",
  DROP COLUMN "missedCheckInOutCount",
  DROP COLUMN "disciplinaryReportCount",
  DROP COLUMN "recentTestNote",
  DROP COLUMN "managerReviewText",
  DROP COLUMN "supervisorReviewText",
  DROP COLUMN "surpriseInspectionText",
  DROP COLUMN "interviewText",
  DROP COLUMN "storeEngagementText";

-- Drop old enum-typed column on evaluation_attachments so the enum can be redefined
ALTER TABLE "evaluation_attachments" DROP COLUMN "section";

-- Replace EvaluationSection: 6 fixed items -> 3 fixed groups
DROP TYPE "EvaluationSection";
CREATE TYPE "EvaluationSection" AS ENUM ('WORK_ATTITUDE', 'PROFESSIONAL_COMPETENCE', 'TEAM_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "EvaluationInputType" AS ENUM ('NUMBER', 'TEXT');

-- CreateTable
CREATE TABLE "evaluation_criteria" (
    "id" TEXT NOT NULL,
    "section" "EvaluationSection" NOT NULL,
    "name" TEXT NOT NULL,
    "inputType" "EvaluationInputType" NOT NULL,
    "allowAttachment" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_answers" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "numberValue" INTEGER,
    "textValue" TEXT,

    CONSTRAINT "evaluation_answers_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "evaluation_attachments" ADD COLUMN "criteriaId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "evaluation_criteria_section_order_idx" ON "evaluation_criteria"("section", "order");

-- CreateIndex
CREATE INDEX "evaluation_answers_formId_idx" ON "evaluation_answers"("formId");

-- AddForeignKey
ALTER TABLE "evaluation_answers" ADD CONSTRAINT "evaluation_answers_formId_fkey" FOREIGN KEY ("formId") REFERENCES "evaluation_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_answers" ADD CONSTRAINT "evaluation_answers_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "evaluation_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_attachments" ADD CONSTRAINT "evaluation_attachments_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "evaluation_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
