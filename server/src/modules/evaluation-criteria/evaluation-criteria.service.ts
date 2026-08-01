import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type {
  CreateEvaluationCriteriaInput,
  UpdateEvaluationCriteriaInput,
} from './evaluation-criteria.dto';

export const evaluationCriteriaService = {
  list() {
    return prisma.evaluationCriteria.findMany({ orderBy: [{ section: 'asc' }, { order: 'asc' }] });
  },

  async getById(id: string) {
    const criteria = await prisma.evaluationCriteria.findUnique({ where: { id } });
    if (!criteria) throw new NotFoundError('Không tìm thấy tiêu chí đánh giá');
    return criteria;
  },

  create(data: CreateEvaluationCriteriaInput) {
    return prisma.evaluationCriteria.create({ data });
  },

  async update(id: string, data: UpdateEvaluationCriteriaInput) {
    await this.getById(id);
    return prisma.evaluationCriteria.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.evaluationCriteria.delete({ where: { id } });
  },
};
