-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "position_permissions" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "position_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "position_permissions_positionId_resource_key" ON "position_permissions"("positionId", "resource");

-- AddForeignKey
ALTER TABLE "position_permissions" ADD CONSTRAINT "position_permissions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Đánh dấu chức vụ hệ thống: Chủ thương hiệu (nhận diện qua quyền "HRM Chủ",
-- vốn chỉ chức vụ này có; nếu không khớp thì lấy theo tên).
UPDATE "positions"
SET "isSystem" = true
WHERE 'HRM Chủ' = ANY("accessScopes") OR "name" = 'Chủ thương hiệu';

-- Giữ nguyên hiện trạng: chức vụ nào đang có quyền CMS thì hôm nay đã là
-- toàn quyền, nên cấp đủ 4 hành động trên mọi chức năng để không ai mất
-- quyền tại thời điểm triển khai.
INSERT INTO "position_permissions" ("id", "positionId", "resource", "canView", "canCreate", "canUpdate", "canDelete")
SELECT
  p."id" || '-' || r."resource",
  p."id",
  r."resource",
  true, true, true, true
FROM "positions" p
CROSS JOIN (VALUES
  ('employees'),
  ('schedules'),
  ('evaluations'),
  ('work-reviews'),
  ('training-logs'),
  ('news'),
  ('notifications'),
  ('branches'),
  ('departments'),
  ('shifts'),
  ('positions'),
  ('levels'),
  ('evaluation-criteria'),
  ('training-criteria'),
  ('work-review-sections')
) AS r("resource")
WHERE 'CMS' = ANY(p."accessScopes")
ON CONFLICT ("positionId", "resource") DO NOTHING;
