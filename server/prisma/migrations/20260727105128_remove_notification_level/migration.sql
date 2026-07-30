-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_levelId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "levelId";

