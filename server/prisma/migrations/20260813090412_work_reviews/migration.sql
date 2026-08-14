-- CreateTable
CREATE TABLE "work_review_sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_review_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_reviews" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "reviewerId" TEXT,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_review_notes" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "sectionId" TEXT,
    "sectionName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "work_review_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_review_sections_order_idx" ON "work_review_sections"("order");

-- CreateIndex
CREATE INDEX "work_reviews_employeeId_weekStartDate_idx" ON "work_reviews"("employeeId", "weekStartDate");

-- CreateIndex
CREATE INDEX "work_review_notes_reviewId_idx" ON "work_review_notes"("reviewId");

-- AddForeignKey
ALTER TABLE "work_reviews" ADD CONSTRAINT "work_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_reviews" ADD CONSTRAINT "work_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_reviews" ADD CONSTRAINT "work_reviews_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_review_notes" ADD CONSTRAINT "work_review_notes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "work_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_review_notes" ADD CONSTRAINT "work_review_notes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "work_review_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

