import { prisma } from '@/config/prisma';
import { ApiError, NotFoundError } from '@/common/errors';
import { allPermissionCodes, describePermission } from '@/common/permissions';
import type { CreatePositionInput, UpdatePositionInput } from './positions.dto';

/**
 * Chỉ nhận mã nằm trong danh sách hợp lệ — mã lạ (gõ sai, mã cũ sau khi đổi
 * tên) bị loại thay vì nằm im trong DB rồi âm thầm không khớp gì.
 *
 * Ngoài ra không ai cấp được mã mà chính mình không có. Không có luật này thì
 * người có POSITIONS.EDIT chỉ cần tự thêm EMPLOYEES.SCOPE_ALL cho chức vụ của
 * mình là thoát khỏi phạm vi chi nhánh — luật viết ở dạng tổng quát nên bao
 * luôn mọi mã thêm về sau, không phải liệt kê danh sách cấm.
 *
 * Mã vượt quyền thì báo lỗi chứ không lặng lẽ lọc bỏ: lọc bỏ sẽ khiến người
 * sửa một chức vụ khác vô tình xoá mất quyền của chức vụ đó mà không hay.
 */
function sanitizePermissions(permissions: string[] | undefined, granterPermissions: string[]) {
  if (!permissions) return undefined;
  const valid = new Set<string>(allPermissionCodes());
  const grantable = new Set(granterPermissions.filter((code) => valid.has(code)));

  const requested = [...new Set(permissions.filter((code) => valid.has(code)))];
  const beyond = requested.filter((code) => !grantable.has(code));
  if (beyond.length > 0) {
    const names = beyond.map(describePermission);
    throw new ApiError(
      403,
      `Bạn không thể cấp quyền mà chính bạn không có: ${names.slice(0, 5).join(', ')}` +
        (names.length > 5 ? `… (${names.length} quyền)` : '')
    );
  }

  return requested.sort();
}

export const positionsService = {
  list() {
    return prisma.position.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const position = await prisma.position.findUnique({ where: { id } });
    if (!position) throw new NotFoundError('Không tìm thấy chức vụ');
    return position;
  },

  create({ permissions, ...rest }: CreatePositionInput, granterPermissions: string[]) {
    return prisma.position.create({
      data: { ...rest, permissions: sanitizePermissions(permissions, granterPermissions) ?? [] },
    });
  },

  async update(
    id: string,
    { permissions, ...rest }: UpdatePositionInput,
    granterPermissions: string[]
  ) {
    const existing = await this.getById(id);
    // Chủ thương hiệu là chốt chặn chống tự khoá mình ra ngoài, nên khoá
    // cứng ở server chứ không chỉ ẩn nút trên giao diện.
    if (existing.isSystem) {
      throw new ApiError(403, 'Không thể sửa chức vụ hệ thống');
    }

    return prisma.position.update({
      where: { id },
      data: { ...rest, permissions: sanitizePermissions(permissions, granterPermissions) },
    });
  },

  async remove(id: string) {
    const existing = await this.getById(id);
    if (existing.isSystem) {
      throw new ApiError(403, 'Không thể xoá chức vụ hệ thống');
    }
    await prisma.position.delete({ where: { id } });
  },
};
