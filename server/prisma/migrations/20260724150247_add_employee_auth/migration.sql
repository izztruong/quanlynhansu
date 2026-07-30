-- AlterTable
ALTER TABLE "employees" ADD COLUMN "email" TEXT,
ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");
