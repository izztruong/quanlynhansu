# Quy ước dự án HRM

## Phân quyền — bắt buộc khi thêm module mới

Hệ thống phân quyền theo **chức vụ × chức năng × hành động** (Xem/Thêm/Sửa/Xoá).
Bảng `PositionPermission`, không có dòng nghĩa là **không có quyền** (từ chối mặc định).

Khi tạo một module mới, làm đủ 3 bước — bỏ bước nào là module đó bị hở quyền:

**1. Khai chức năng** trong `server/src/common/permissions.ts`:

```ts
export const PERMISSION_RESOURCES = [
  ...
  { resource: 'ten-module', label: 'Tên hiển thị tiếng Việt' },
];
```

**2. Gắn cổng cho TẤT CẢ route**, kể cả `GET`:

```ts
router.get('/', requirePermission('ten-module'), asyncHandler(controller.list));
router.post('/', requirePermission('ten-module'), asyncHandler(controller.create));
```

Middleware tự suy hành động từ phương thức HTTP, không cần khai thêm:

```
GET → Xem    POST → Thêm    PUT/PATCH → Sửa    DELETE → Xoá
```

Ngoại lệ duy nhất: route **tự phục vụ** của chính người đang đăng nhập (chấm công
trên app, `/auth/me`) — những cái này chỉ cần `requireAuth`.

**3. Phía client**: khai `resource` cho mục menu trong `nav-items.ts` để tự ẩn khi
không có quyền, truyền `resource` cho `CrudTable`, và bọc nút thao tác bằng
`can('ten-module', 'create' | 'update' | 'delete')` từ `useAuth()`.

### Nguyên tắc không được vi phạm

- **Ẩn nút trên giao diện chỉ để cho gọn mắt.** Việc chặn thật luôn nằm ở
  `requirePermission` phía server — ai gọi thẳng API vẫn phải bị chặn.
- **Đọc quyền từ DB mỗi request, không nhét vào JWT.** Nhét vào token thì gỡ quyền
  xong người đang đăng nhập vẫn giữ quyền cũ tới khi đăng nhập lại.
- **Chức vụ `isSystem` (Chủ thương hiệu) luôn bỏ qua mọi kiểm tra** và không cho
  sửa/xoá. Đây là chốt chặn để cấu hình phân quyền sai không khoá hết mọi người
  ra ngoài — đừng bỏ.

## Prisma

- **Tắt dev server trước khi chạy `prisma generate`** — Windows khoá file engine khi
  server đang chạy, không tắt thì generate lỗi.
- Môi trường này không dùng được `prisma migrate dev` (cần tương tác). Tạo migration
  bằng:

  ```bash
  npx prisma migrate diff --from-url "<DATABASE_URL>" \
    --to-schema-datamodel prisma/schema.prisma --script \
    > prisma/migrations/<timestamp>_<ten>/migration.sql
  npx prisma migrate deploy
  ```

- Đổi kiểu cột trên bảng đang có dữ liệu ở Neon sẽ gây lỗi
  `cached plan must not change result type` cho tới khi restart service — do kết nối
  pooled còn giữ kế hoạch truy vấn cũ.

## Dữ liệu lịch sử

Khi một bản ghi tham chiếu tới danh mục cấu hình được (tiêu chí đánh giá, mục nhận
xét, tiêu chí học việc), **chụp lại tên và thang điểm vào chính bản ghi đó**
(`criteriaName`, `maxScore`, `sectionName`...). Sửa hoặc xoá danh mục về sau không
được phép làm đổi nội dung hay tổng điểm của phiếu đã lưu — giống dòng hàng trên
hoá đơn giữ đơn giá tại thời điểm bán.
