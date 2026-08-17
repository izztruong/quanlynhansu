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

const ACTION_LABELS = {
  VIEW: 'Xem',
  ADD: 'Thêm',
  EDIT: 'Sửa',
  DELETE: 'Xoá',
} as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number]['resource'];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Mã hành động, vd "EMPLOYEES.ADD" — dùng để chặn route. */
export type ActionCode = `${PermissionResource}.${PermissionAction}`;

/**
 * Mã phạm vi dữ liệu. Chúng nằm chung mảng permissions với mã hành động
 * nhưng đi đường khác: mã hành động vào requirePermission để chặn thao tác,
 * mã phạm vi vào mệnh đề where để thu hẹp dữ liệu (xem common/data-scope.ts).
 *
 * Không có mã nào = hẹp nhất (chỉ thấy chính mình), đúng nguyên tắc từ chối
 * mặc định đang dùng cho mã hành động.
 */
export const SCOPE_CODES = {
  BRANCH: 'EMPLOYEES.SCOPE_BRANCH',
  ALL: 'EMPLOYEES.SCOPE_ALL',
} as const;

export type ScopeCode = (typeof SCOPE_CODES)[keyof typeof SCOPE_CODES];

export type PermissionCode = ActionCode | ScopeCode;

/** Ba mức xếp thang SELF < BRANCH < ALL, giải bằng lấy mức cao nhất được cấp. */
export type DataScope = 'SELF' | 'BRANCH' | 'ALL';

// Mã ngoài lưới RESOURCE × ACTION, khai theo chức năng để giao diện biết
// dòng nào có thêm lựa chọn. Thêm mức phạm vi mới sau này chỉ là thêm một
// chuỗi ở đây, không phải đổi schema.
export const EXTRA_CODES: Partial<Record<PermissionResource, readonly ScopeCode[]>> = {
  EMPLOYEES: [SCOPE_CODES.BRANCH, SCOPE_CODES.ALL],
};

// Ba mức bày ra cho giao diện chọn một trong ba. code = null là mức hẹp nhất,
// biểu diễn bằng việc không lưu mã nào.
export const SCOPE_OPTIONS = [
  { code: null, label: 'Chỉ bản thân' },
  { code: SCOPE_CODES.BRANCH, label: 'Chi nhánh của mình' },
  { code: SCOPE_CODES.ALL, label: 'Toàn hệ thống' },
] as const;

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
  const actionCodes = PERMISSION_RESOURCES.flatMap((r) =>
    PERMISSION_ACTIONS.map((a) => `${r.resource}.${a}` as ActionCode)
  );
  const extras = Object.values(EXTRA_CODES).flatMap((codes) => [...codes]);
  return [...actionCodes, ...extras];
}

/**
 * Đổi mã sang tên chức năng đọc được ("EMPLOYEES.ADD" → "thêm nhân viên").
 * Thông báo lỗi đưa cho người dùng thì viết chức năng, đừng bắt họ tra mã.
 */
export function describePermission(code: string): string {
  const scope = SCOPE_OPTIONS.find((option) => option.code === code);
  if (scope) return `phạm vi dữ liệu ${scope.label.toLowerCase()}`;

  const [resource, action] = code.split('.');
  const resourceLabel = PERMISSION_RESOURCES.find((r) => r.resource === resource)?.label;
  const actionLabel = ACTION_LABELS[action as PermissionAction];
  // Mã lạ thì trả nguyên văn còn hơn nuốt mất, để lần ra được khi có sự cố.
  if (!resourceLabel || !actionLabel) return code;

  return `${actionLabel.toLowerCase()} ${resourceLabel.toLowerCase()}`;
}

export function scopeOf(permissions: readonly string[]): DataScope {
  if (permissions.includes(SCOPE_CODES.ALL)) return 'ALL';
  if (permissions.includes(SCOPE_CODES.BRANCH)) return 'BRANCH';
  return 'SELF';
}

export interface Access {
  employeeId: string;
  isSystem: boolean;
  permissions: string[];
  scope: DataScope;
  /** Chi nhánh của chính người đăng nhập; scope quyết định dùng nó thế nào. */
  branchId: string | null;
}

/**
 * Đọc quyền từ DB chứ không lấy từ JWT: nhét vào token thì admin gỡ quyền
 * xong, người đang đăng nhập vẫn giữ quyền cũ tới khi đăng nhập lại — đó
 * là lỗ hổng thật, không phải chuyện lý thuyết.
 */
export async function resolveAccess(employeeId: string): Promise<Access> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { branchId: true, position: { select: { isSystem: true, permissions: true } } },
  });

  if (!employee) {
    return { employeeId, isSystem: false, permissions: [], scope: 'SELF', branchId: null };
  }

  // Chức vụ hệ thống (Chủ thương hiệu) luôn toàn quyền, bỏ qua danh sách mã.
  if (employee.position.isSystem) {
    return {
      employeeId,
      isSystem: true,
      permissions: allPermissionCodes(),
      scope: 'ALL',
      branchId: employee.branchId,
    };
  }

  const permissions = employee.position.permissions;
  return {
    employeeId,
    isSystem: false,
    permissions,
    scope: scopeOf(permissions),
    // Một nhân viên chỉ thuộc một chi nhánh, nên phạm vi BRANCH suy thẳng
    // từ chi nhánh của chính người đăng nhập, không cần cấu hình thêm.
    branchId: employee.branchId,
  };
}

/** Giải một lần cho mỗi request rồi dùng lại, tránh truy DB lặp. */
export async function getAccess(req: Request): Promise<Access> {
  if (req.access) return req.access;
  if (!req.user?.employeeId) throw new Error('getAccess gọi trước requireAuth');
  const access = await resolveAccess(req.user.employeeId);
  req.access = access;
  return access;
}

/**
 * Truyền tên chức năng ("EMPLOYEES") thì hành động suy từ phương thức HTTP;
 * truyền mã đầy đủ ("EMPLOYEES.EDIT") thì dùng đúng mã đó.
 *
 * Kiểu tham số cố tình loại mã phạm vi: chúng thu hẹp dữ liệu chứ không chặn
 * thao tác, đưa vào đây sẽ trả 403 thay vì lọc bớt.
 */
export function requirePermission(target: PermissionResource | ActionCode) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.employeeId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { isSystem, permissions } = await getAccess(req);
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

/**
 * Cho qua nếu có BẤT KỲ mã nào trong danh sách.
 *
 * Dùng cho danh mục cấu hình mà form của module khác phải đọc để đổ dropdown:
 * người được tạo nhật ký học việc cần đọc bộ tiêu chí chấm điểm, nhưng không
 * nhất thiết được vào trang cấu hình tiêu chí. Gắn cổng chỉ bằng quyền của
 * chính danh mục sẽ làm form rỗng và không ai hiểu tại sao.
 */
export function requireAnyPermission(...codes: ActionCode[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.employeeId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { isSystem, permissions } = await getAccess(req);
    if (isSystem || codes.some((code) => permissions.includes(code))) {
      next();
      return;
    }

    res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  };
}
