import type { NextFunction, Request, Response } from 'express';
import { prisma } from '@/config/prisma';

const ADMIN_SCOPES = ['CMS', 'HRM Chủ'];

export function isAdminScope(accessScopes: string[]) {
  return accessScopes.some((scope) => ADMIN_SCOPES.includes(scope));
}

// Danh sách chức năng phân quyền được. Để hằng số trong code thay vì bảng
// vì chúng gắn với module có thật trong mã nguồn — thêm module mới thì
// khai thêm ở đây (xem CLAUDE.md).
export const PERMISSION_RESOURCES = [
  { resource: 'EMPLOYEES', label: 'Nhân viên' },
  { resource: 'SCHEDULES', label: 'Lịch làm việc' },
  { resource: 'EVALUATIONS', label: 'Phiếu đánh giá nhân viên' },
  { resource: 'WORK_REVIEWS', label: 'Phiếu đánh giá nhân viên (Tuần)' },
  { resource: 'TRAINING_LOGS', label: 'Nhật ký học việc' },
  { resource: 'NEWS', label: 'Tin tức' },
  { resource: 'NOTIFICATIONS', label: 'Thông báo' },
  { resource: 'BRANCHES', label: 'Chi nhánh' },
  { resource: 'DEPARTMENTS', label: 'Bộ phận' },
  { resource: 'SHIFTS', label: 'Ca làm việc' },
  { resource: 'POSITIONS', label: 'Chức vụ' },
  { resource: 'LEVELS', label: 'Level' },
  { resource: 'EVALUATION_CRITERIA', label: 'Cấu hình phiếu đánh giá' },
  { resource: 'TRAINING_CRITERIA', label: 'Cấu hình học việc' },
  { resource: 'WORK_REVIEW_SECTIONS', label: 'Cấu hình đánh giá tuần' },
] as const;

export const PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number]['resource'];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Mã quyền đầy đủ, vd "EMPLOYEES.ADD". */
export type PermissionCode = `${PermissionResource}.${PermissionAction}`;

// Phương thức HTTP suy thẳng ra hành động, nhờ vậy phần lớn route chỉ cần
// khai tên chức năng chứ không phải viết đủ mã.
function actionOf(method: string): PermissionAction {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'ADD';
    case 'PUT':
    case 'PATCH':
      return 'EDIT';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'VIEW';
  }
}

export function allPermissionCodes(): PermissionCode[] {
  return PERMISSION_RESOURCES.flatMap((r) =>
    PERMISSION_ACTIONS.map((a) => `${r.resource}.${a}` as PermissionCode)
  );
}

/**
 * Đọc quyền từ DB chứ không lấy từ JWT: nhét vào token thì admin gỡ quyền
 * xong, người đang đăng nhập vẫn giữ quyền cũ tới khi đăng nhập lại — đó
 * là lỗ hổng thật, không phải chuyện lý thuyết.
 */
export async function resolvePermissions(
  employeeId: string
): Promise<{ isSystem: boolean; permissions: string[] }> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { position: { select: { isSystem: true, permissions: true } } },
  });

  if (!employee) return { isSystem: false, permissions: [] };

  // Chức vụ hệ thống (Chủ thương hiệu) luôn toàn quyền, bỏ qua danh sách mã.
  if (employee.position.isSystem) {
    return { isSystem: true, permissions: allPermissionCodes() };
  }

  return { isSystem: false, permissions: employee.position.permissions };
}

/**
 * Truyền tên chức năng ("EMPLOYEES") thì hành động suy từ phương thức HTTP;
 * truyền mã đầy đủ ("EMPLOYEES.EXPORT") thì dùng đúng mã đó — dùng cho các
 * hành động ngoài CRUD.
 */
export function requirePermission(target: PermissionResource | PermissionCode) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.employeeId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { isSystem, permissions } = await resolvePermissions(req.user.employeeId);
    if (isSystem) {
      next();
      return;
    }

    const code = target.includes('.') ? target : `${target}.${actionOf(req.method)}`;

    if (!permissions.includes(code)) {
      res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
      return;
    }

    next();
  };
}
