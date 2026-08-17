# Quy ước dự án HRM

## Phân quyền — bắt buộc khi thêm module mới

Hệ thống phân quyền theo **chức vụ × chức năng × hành động** (Xem/Thêm/Sửa/Xoá).
Lưu bằng mã phẳng `RESOURCE.ACTION` trong mảng `Position.permissions`; không có mã
nghĩa là **không có quyền** (từ chối mặc định).

Khi tạo một module mới, làm đủ 3 bước — bỏ bước nào là module đó bị hở quyền:

**1. Khai chức năng** trong `server/src/common/permissions.ts`:

```ts
export const PERMISSION_RESOURCES = [
  ...
  { resource: 'TEN_MODULE', label: 'Tên hiển thị tiếng Việt' },
];
```

**2. Gắn cổng cho TẤT CẢ route**, kể cả `GET`:

```ts
router.get('/', requirePermission('TEN_MODULE'), asyncHandler(controller.list));
router.post('/', requirePermission('TEN_MODULE'), asyncHandler(controller.create));
```

Middleware tự suy hành động từ phương thức HTTP, không cần khai thêm:

```
GET → Xem    POST → Thêm    PUT/PATCH → Sửa    DELETE → Xoá
```

Ngoại lệ duy nhất: route **tự phục vụ** của chính người đang đăng nhập (chấm công
trên app, `/auth/me`) — những cái này chỉ cần `requireAuth`.

### Danh mục dùng để đổ dropdown

Gắn cổng `requirePermission` cho `GET` của danh mục là đúng quy ước, nhưng nếu form
của module khác cần danh mục đó để đổ ô chọn thì chức vụ thiếu quyền sẽ mở form ra
thấy **rỗng, không báo lỗi gì**. Bẫy này chỉ lộ khi tạo chức vụ hẹp — chức vụ toàn
quyền không bao giờ chạm phải.

Hai cách xử lý, chọn theo việc danh mục đó có khái niệm "của chính mình" hay không:

**Có** (chi nhánh) — cho thấy đúng bản ghi của họ, dùng helper trong `data-scope.ts`:

```ts
// Thấy hết chi nhánh khi vừa có phạm vi ALL, vừa có BRANCHES.VIEW.
// Thiếu một trong hai → ô chọn chỉ còn chi nhánh của chính họ.
const branches = await service.list(await branchFilter(req));
```

Đường ghi phải theo **đúng luật đó** (`assertBranchInScope`, `writableBranchId`):
quán không hiện trong ô chọn thì cũng không gán vào được, kể cả khi biết id và gọi
thẳng API. Thu hẹp danh sách mà bỏ ngỏ `GET /:id` cũng vậy — hai đường một luật.

**Không** (tiêu chí học việc, mục nhận xét tuần) — cho qua nếu có quyền ở **module
tiêu thụ** nó:

```ts
router.get(
  '/',
  requireAnyPermission('TRAINING_CRITERIA.VIEW', 'TRAINING_LOGS.VIEW'),
  asyncHandler(controller.list)
);
```

Đừng áp cách thứ nhất cho chức vụ / level / ca làm việc: "chỉ thấy của chính mình"
nghĩa là chỉ tạo được nhân viên trùng chức vụ với mình, form mất tác dụng.

**3. Phía client**: khai `resource` cho mục menu trong `nav-items.ts` để tự ẩn khi
không có quyền, truyền `resource` cho `CrudTable`, và bọc nút thao tác bằng
`can('TEN_MODULE', 'create' | 'update' | 'delete')` từ `useAuth()`.

## Phạm vi dữ liệu — bắt buộc khi module đụng tới nhân viên

Trục thứ hai, độc lập với hành động: mã hành động trả lời *được làm gì*, mã phạm vi
trả lời *được làm trên ai*. Ba mức xếp thang, giải bằng lấy mức cao nhất được cấp:

```
EMPLOYEES.SCOPE_ALL      → toàn hệ thống
EMPLOYEES.SCOPE_BRANCH   → chi nhánh của chính người đăng nhập
(không có mã)            → chỉ bản thân
```

Một họ mã duy nhất ở `EMPLOYEES` chi phối **mọi dữ liệu dẫn xuất từ nhân viên**
(phiếu đánh giá, đánh giá tuần, nhật ký học việc, lịch làm, chấm công). Đừng tách
mã phạm vi riêng cho từng module: thấy hồ sơ mà không thấy phiếu thì cụt, thấy phiếu
mà không thấy hồ sơ thì hở.

Dùng helper trong `server/src/common/data-scope.ts`, đủ **cả hai** vế:

```ts
// Lọc danh sách
const forms = await service.list(await employeeRelationFilter(req));

// Chốt từng bản ghi — nửa hay bị quên
await assertEmployeeInScope(req, input.employeeId);
```

Bốn chỗ luôn phải rà lại khi thêm module:

- Nhân viên đích nằm ở **body** (`POST`, và cả `PUT` nếu cho sửa `employeeId`),
  không chỉ ở `params`.
- **Chuyển chi nhánh** phải chốt cả hai đầu — nguồn và đích.
- **Xuất file** đi đường riêng, không dùng lại `list()`.
- **Nhập file** báo lỗi theo từng dòng, và phải chặn cả mã nhân viên đang thuộc
  chi nhánh khác chứ không chỉ tên chi nhánh trong dòng đó.

`getById`/`remove` trộn phạm vi thẳng vào `where` rồi dùng `findFirst`, nên bản ghi
ngoài phạm vi trả **404 chứ không 403** — vừa chặn, vừa không hé lộ nó có tồn tại.

### Nguyên tắc không được vi phạm

- **Ẩn nút trên giao diện chỉ để cho gọn mắt.** Việc chặn thật luôn nằm ở
  `requirePermission` phía server — ai gọi thẳng API vẫn phải bị chặn.
- **Đọc quyền từ DB mỗi request, không nhét vào JWT.** Nhét vào token thì gỡ quyền
  xong người đang đăng nhập vẫn giữ quyền cũ tới khi đăng nhập lại.
- **Chức vụ `isSystem` (Chủ thương hiệu) luôn bỏ qua mọi kiểm tra** và không cho
  sửa/xoá. Đây là chốt chặn để cấu hình phân quyền sai không khoá hết mọi người
  ra ngoài — đừng bỏ.
- **Không ai cấp được mã mà chính mình không có** (`sanitizePermissions`). Thiếu
  luật này thì người có `POSITIONS.EDIT` chỉ cần tự thêm `EMPLOYEES.SCOPE_ALL` là
  thoát khỏi phạm vi chi nhánh.
- **Mã phạm vi không bao giờ dùng để chặn route.** Chúng nằm chung mảng
  `permissions` nhưng đi đường khác — mã hành động vào `requirePermission`, mã
  phạm vi vào mệnh đề `where`. Viết `requirePermission('EMPLOYEES.SCOPE_ALL')` sẽ
  trả 403 thay vì thu hẹp dữ liệu; kiểu `ActionCode` cố tình loại chúng ra để
  compiler chặn trước.

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
