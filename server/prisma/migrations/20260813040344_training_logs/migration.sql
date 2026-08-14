-- CreateEnum
CREATE TYPE "TrainingLogStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "training_criteria_groups" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_criteria_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_criteria" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "training_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_logs" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "mentorId" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "status" "TrainingLogStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "overallOpinion" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "trainingLogId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "sessionDate" DATE,
    "learnedContent" TEXT,
    "assignedTasks" TEXT,
    "evalAppearance" TEXT,
    "evalCommunication" TEXT,
    "evalPractice" TEXT,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_scores" (
    "id" TEXT NOT NULL,
    "trainingLogId" TEXT NOT NULL,
    "criteriaId" TEXT,
    "groupName" TEXT NOT NULL,
    "criteriaName" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "training_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_criteria_groups_positionId_order_idx" ON "training_criteria_groups"("positionId", "order");

-- CreateIndex
CREATE INDEX "training_criteria_groupId_order_idx" ON "training_criteria"("groupId", "order");

-- CreateIndex
CREATE INDEX "training_logs_employeeId_createdAt_idx" ON "training_logs"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "training_sessions_trainingLogId_sessionNumber_idx" ON "training_sessions"("trainingLogId", "sessionNumber");

-- CreateIndex
CREATE INDEX "training_scores_trainingLogId_idx" ON "training_scores"("trainingLogId");

-- AddForeignKey
ALTER TABLE "training_criteria_groups" ADD CONSTRAINT "training_criteria_groups_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_criteria" ADD CONSTRAINT "training_criteria_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "training_criteria_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainingLogId_fkey" FOREIGN KEY ("trainingLogId") REFERENCES "training_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_scores" ADD CONSTRAINT "training_scores_trainingLogId_fkey" FOREIGN KEY ("trainingLogId") REFERENCES "training_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_scores" ADD CONSTRAINT "training_scores_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "training_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

