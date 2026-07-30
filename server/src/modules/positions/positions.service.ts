import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { CreatePositionInput, UpdatePositionInput } from './positions.dto';

export const positionsService = {
  list() {
    return prisma.position.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const position = await prisma.position.findUnique({ where: { id } });
    if (!position) throw new NotFoundError('Không tìm thấy chức vụ');
    return position;
  },

  create(data: CreatePositionInput) {
    return prisma.position.create({ data });
  },

  async update(id: string, data: UpdatePositionInput) {
    await this.getById(id);
    return prisma.position.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.position.delete({ where: { id } });
  },
};
