import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type {
  CreateTrainingCriteriaGroupInput,
  CreateTrainingCriteriaInput,
  UpdateTrainingCriteriaGroupInput,
  UpdateTrainingCriteriaInput,
} from './training-criteria.dto';

const groupInclude = {
  department: true,
  criteria: { orderBy: { order: 'asc' } },
} as const;

export const trainingCriteriaService = {
  // departmentId lọc theo bộ phận, dùng khi tạo phiếu để nạp đúng bộ tiêu chí.
  listGroups(departmentId?: string) {
    return prisma.trainingCriteriaGroup.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: [{ departmentId: 'asc' }, { order: 'asc' }],
      include: groupInclude,
    });
  },

  async getGroupById(id: string) {
    const group = await prisma.trainingCriteriaGroup.findUnique({
      where: { id },
      include: groupInclude,
    });
    if (!group) throw new NotFoundError('Không tìm thấy nhóm tiêu chí');
    return group;
  },

  createGroup(data: CreateTrainingCriteriaGroupInput) {
    return prisma.trainingCriteriaGroup.create({ data, include: groupInclude });
  },

  async updateGroup(id: string, data: UpdateTrainingCriteriaGroupInput) {
    await this.getGroupById(id);
    return prisma.trainingCriteriaGroup.update({ where: { id }, data, include: groupInclude });
  },

  async removeGroup(id: string) {
    await this.getGroupById(id);
    await prisma.trainingCriteriaGroup.delete({ where: { id } });
  },

  async getCriteriaById(id: string) {
    const criteria = await prisma.trainingCriteria.findUnique({ where: { id } });
    if (!criteria) throw new NotFoundError('Không tìm thấy tiêu chí');
    return criteria;
  },

  createCriteria(data: CreateTrainingCriteriaInput) {
    return prisma.trainingCriteria.create({ data });
  },

  async updateCriteria(id: string, data: UpdateTrainingCriteriaInput) {
    await this.getCriteriaById(id);
    return prisma.trainingCriteria.update({ where: { id }, data });
  },

  async removeCriteria(id: string) {
    await this.getCriteriaById(id);
    await prisma.trainingCriteria.delete({ where: { id } });
  },
};
