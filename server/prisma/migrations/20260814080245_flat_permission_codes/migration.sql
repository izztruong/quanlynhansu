-- Chuyển phân quyền từ bảng 4 cột boolean sang mảng mã "RESOURCE.ACTION".
-- Lý do: thêm hành động ngoài CRUD (xuất file, duyệt đơn...) không phải
-- đổi schema nữa.

ALTER TABLE "positions" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Chuyển dữ liệu cũ: mỗi cột boolean bật thành một mã tương ứng.
UPDATE "positions" p
SET "permissions" = COALESCE(sub.codes, ARRAY[]::TEXT[])
FROM (
  SELECT
    pp."positionId",
    array_agg(code ORDER BY code) AS codes
  FROM "position_permissions" pp
  CROSS JOIN LATERAL (
    SELECT unnest(ARRAY[
      CASE WHEN pp."canView"   THEN upper(replace(pp."resource", '-', '_')) || '.VIEW'   END,
      CASE WHEN pp."canCreate" THEN upper(replace(pp."resource", '-', '_')) || '.ADD'    END,
      CASE WHEN pp."canUpdate" THEN upper(replace(pp."resource", '-', '_')) || '.EDIT'   END,
      CASE WHEN pp."canDelete" THEN upper(replace(pp."resource", '-', '_')) || '.DELETE' END
    ]) AS code
  ) codes
  WHERE code IS NOT NULL
  GROUP BY pp."positionId"
) sub
WHERE p."id" = sub."positionId";

DROP TABLE "position_permissions";
