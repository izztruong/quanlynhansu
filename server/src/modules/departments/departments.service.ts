import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './departments.dto';

export const departmentsService = {
  list() {
    return prisma.department.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async getById(id: string) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundError('Không tìm thấy bộ phận');
    return department;
  },

  create(data: CreateDepartmentInput) {
    return prisma.department.create({ data });
  },

  async update(id: string, data: UpdateDepartmentInput) {
    await this.getById(id);
    return prisma.department.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.department.delete({ where: { id } });
  },
};
