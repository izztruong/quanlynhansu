import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { CreateLevelInput, UpdateLevelInput } from './levels.dto';

export const levelsService = {
  list() {
    return prisma.level.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const level = await prisma.level.findUnique({ where: { id } });
    if (!level) throw new NotFoundError('Không tìm thấy level');
    return level;
  },

  create(data: CreateLevelInput) {
    return prisma.level.create({ data });
  },

  async update(id: string, data: UpdateLevelInput) {
    await this.getById(id);
    return prisma.level.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.level.delete({ where: { id } });
  },
};
