import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { ForbiddenError, NotFoundError } from '@/common/errors';
import { getAccess } from '@/common/permissions';

/**
 * Thu hẹp dữ liệu theo mã phạm vi EMPLOYEES.SCOPE_* của chức vụ.
 *
 * Một họ mã duy nhất chi phối toàn bộ dữ liệu dẫn xuất từ nhân viên (phiếu
 * đánh giá, đánh giá tuần, nhật ký học việc, lịch làm, chấm công): thấy hồ sơ
 * mà không thấy phiếu thì cụt, thấy phiếu mà không thấy hồ sơ thì hở.
 *
 * Lọc danh sách là một nửa việc. Nửa hay bị quên là chốt từng bản ghi ở
 * đường sửa/xoá — không có assertEmployeeInScope thì gọi thẳng
 * PUT /employees/<id chi nhánh khác> vẫn lọt.
 */

const OUT_OF_SCOPE = 'Nhân viên này không thuộc phạm vi quản lý của bạn';

/** Điều kiện lọc đặt thẳng vào prisma.employee.findMany. */
export async function employeeFilter(req: Request): Promise<Prisma.EmployeeWhereInput> {
  const access = await getAccess(req);
  if (access.scope === 'ALL') return {};
  if (access.scope === 'BRANCH') return { branchId: access.branchId ?? '' };
  return { id: access.employeeId };
}

/**
 * Cùng điều kiện trên, cho bảng trỏ tới nhân viên qua quan hệ `employee`.
 * Trộn thẳng vào `where` của các bảng dẫn xuất; rỗng nghĩa là không giới hạn.
 */
export type EmployeeScopeWhere = { employee?: Prisma.EmployeeWhereInput };

export async function employeeRelationFilter(req: Request): Promise<EmployeeScopeWhere> {
  const filter = await employeeFilter(req);
  return Object.keys(filter).length === 0 ? {} : { employee: filter };
}

/** Chốt trước khi đọc/sửa/xoá một nhân viên cụ thể. */
export async function assertEmployeeInScope(req: Request, employeeId: string) {
  const access = await getAccess(req);
  if (access.scope === 'ALL') return;

  if (access.scope === 'SELF') {
    if (employeeId !== access.employeeId) throw new ForbiddenError(OUT_OF_SCOPE);
    return;
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { branchId: true },
  });
  if (!employee) throw new NotFoundError('Không tìm thấy nhân viên');
  if (employee.branchId !== access.branchId) throw new ForbiddenError(OUT_OF_SCOPE);
}

/**
 * Chạm được tới mọi chi nhánh khi thoả CẢ HAI, thiếu một là chỉ còn chi nhánh
 * của chính mình:
 *
 * 1. Phạm vi dữ liệu là ALL.
 * 2. Có quyền Xem ở mục Chi nhánh.
 *
 * Điều kiện 2 là để giải bài toán ô chọn: chức vụ được Thêm nhân viên nhưng
 * không được xem danh mục chi nhánh vẫn phải mở được form, chỉ là trong ô chọn
 * đúng một quán của họ. Chặn thẳng thì form rỗng và không ai hiểu vì sao, mở
 * thẳng thì lộ cả danh sách quán — cho thấy của chính mình là vừa đủ làm việc.
 */
function canReachAllBranches(access: { scope: string; permissions: string[] }) {
  return access.scope === 'ALL' && access.permissions.includes('BRANCHES.VIEW');
}

/**
 * Chốt chi nhánh đích khi tạo nhân viên mới hoặc chuyển chi nhánh — nếu chỉ
 * chốt nhân viên nguồn thì vẫn đẩy được người sang quán khác.
 *
 * Dùng đúng luật của ô chọn: quán không hiện ra trong danh sách thì cũng không
 * gán vào được, kể cả khi biết id và gọi thẳng API.
 */
export async function assertBranchInScope(req: Request, branchId: string) {
  const access = await getAccess(req);
  if (canReachAllBranches(access)) return;
  if (branchId !== access.branchId) {
    throw new ForbiddenError('Chi nhánh này không thuộc phạm vi quản lý của bạn');
  }
}

/** Chi nhánh duy nhất được phép ghi vào; null = không giới hạn. */
export async function writableBranchId(req: Request): Promise<string | null> {
  const access = await getAccess(req);
  return canReachAllBranches(access) ? null : access.branchId;
}

/** Danh mục chi nhánh, thu hẹp theo cùng luật. */
export async function branchFilter(req: Request): Promise<Prisma.BranchWhereInput> {
  const access = await getAccess(req);
  return canReachAllBranches(access) ? {} : { id: access.branchId ?? '' };
}

/** Cùng luật trên, cho đường đọc một chi nhánh cụ thể. */
export async function assertBranchVisible(req: Request, branchId: string) {
  const access = await getAccess(req);
  if (canReachAllBranches(access)) return;
  if (branchId !== access.branchId) throw new NotFoundError('Không tìm thấy chi nhánh');
}
