-- Phạm vi dữ liệu lưu bằng mã quyền chứ không phải cột riêng, nên migration
-- này không đổi cấu trúc bảng — chỉ cấp mã.
--
-- Không có mã SCOPE_* nghĩa là hẹp nhất (chỉ thấy chính mình). Cấp
-- EMPLOYEES.SCOPE_ALL cho các chức vụ đang có quyền để deploy xong không ai
-- bị đổi hành vi; việc thu hẹp là thao tác tay của admin trên từng chức vụ.
--
-- Bỏ qua chức vụ chưa có mã nào (vd "Nhân viên" thuần): chúng vốn không truy
-- cập được gì, cấp thêm phạm vi toàn hệ thống chỉ nới rộng những route chưa
-- gắn cổng quyền như GET /attendance.
UPDATE "positions"
SET "permissions" = array_append("permissions", 'EMPLOYEES.SCOPE_ALL')
WHERE cardinality("permissions") > 0
  AND NOT ('EMPLOYEES.SCOPE_ALL' = ANY ("permissions"));
