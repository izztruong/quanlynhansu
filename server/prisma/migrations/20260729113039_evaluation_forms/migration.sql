-- CreateEnum
CREATE TYPE "EvaluationSection" AS ENUM ('RECENT_TEST', 'MANAGER_REVIEW', 'SUPERVISOR_REVIEW', 'SURPRISE_INSPECTION', 'DIRECT_INTERVIEW', 'STORE_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "evaluation_forms" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recentTestNote" TEXT,
    "managerReviewText" TEXT,
    "supervisorReviewText" TEXT,
    "surpriseInspectionText" TEXT,
    "interviewText" TEXT,
    "storeEngagementText" TEXT,

    CONSTRAINT "evaluation_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_attachments" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "section" "EvaluationSection" NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluation_forms_employeeId_createdAt_idx" ON "evaluation_forms"("employeeId", "createdAt");

-- AddForeignKey
ALTER TABLE "evaluation_forms" ADD CONSTRAINT "evaluation_forms_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_attachments" ADD CONSTRAINT "evaluation_attachments_formId_fkey" FOREIGN KEY ("formId") REFERENCES "evaluation_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

