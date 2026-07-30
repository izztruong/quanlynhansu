import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { CreateBranchInput, UpdateBranchInput } from './branches.dto';

export const branchesService = {
  list() {
    return prisma.branch.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundError('Không tìm thấy chi nhánh');
    return branch;
  },

  create(data: CreateBranchInput) {
    return prisma.branch.create({ data });
  },

  async update(id: string, data: UpdateBranchInput) {
    await this.getById(id);
    return prisma.branch.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.branch.delete({ where: { id } });
  },
};
