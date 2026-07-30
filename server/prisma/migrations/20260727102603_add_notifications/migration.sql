-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "appliesToAllBranches" BOOLEAN NOT NULL DEFAULT true,
    "appliesToAllDepartments" BOOLEAN NOT NULL DEFAULT true,
    "employeeTypeScope" "EmployeeType",
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_branches" (
    "notificationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "notification_branches_pkey" PRIMARY KEY ("notificationId","branchId")
);

-- CreateTable
CREATE TABLE "notification_departments" (
    "notificationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "notification_departments_pkey" PRIMARY KEY ("notificationId","departmentId")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_branches" ADD CONSTRAINT "notification_branches_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_branches" ADD CONSTRAINT "notification_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_departments" ADD CONSTRAINT "notification_departments_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_departments" ADD CONSTRAINT "notification_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

