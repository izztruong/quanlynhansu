import { prisma } from '@/config/prisma';
import { ApiError, NotFoundError } from '@/common/errors';
import { allPermissionCodes } from '@/common/permissions';
import type { CreatePositionInput, UpdatePositionInput } from './positions.dto';

// Chỉ nhận mã nằm trong danh sách hợp lệ — mã lạ (gõ sai, mã cũ sau khi
// đổi tên) bị loại thay vì nằm im trong DB rồi âm thầm không khớp gì.
function sanitizePermissions(permissions?: string[]) {
  if (!permissions) return undefined;
  const valid = new Set<string>(allPermissionCodes());
  return [...new Set(permissions.filter((code) => valid.has(code)))].sort();
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

  create({ permissions, ...rest }: CreatePositionInput) {
    return prisma.position.create({
      data: { ...rest, permissions: sanitizePermissions(permissions) ?? [] },
    });
  },

  async update(id: string, { permissions, ...rest }: UpdatePositionInput) {
    const existing = await this.getById(id);
    // Chủ thương hiệu là chốt chặn chống tự khoá mình ra ngoài, nên khoá
    // cứng ở server chứ không chỉ ẩn nút trên giao diện.
    if (existing.isSystem) {
      throw new ApiError(403, 'Không thể sửa chức vụ hệ thống');
    }

    return prisma.position.update({
      where: { id },
      data: { ...rest, permissions: sanitizePermissions(permissions) },
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
