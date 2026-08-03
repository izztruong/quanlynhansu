import { prisma } from '@/config/prisma';
import { ApiError, NotFoundError } from '@/common/errors';
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
    const existing = await this.getById(id);

    // numberValue/textValue are separate columns on EvaluationAnswer —
    // switching inputType after answers exist would silently orphan
    // whichever column those answers were written to (the view reads the
    // column matching the *current* inputType). Lock it once in use.
    if (data.inputType && data.inputType !== existing.inputType) {
      const answerCount = await prisma.evaluationAnswer.count({ where: { criteriaId: id } });
      if (answerCount > 0) {
        throw new ApiError(
          409,
          'Không thể đổi loại giá trị vì tiêu chí đã có dữ liệu trả lời. Hãy tạo tiêu chí mới thay thế.'
        );
      }
    }

    return prisma.evaluationCriteria.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.evaluationCriteria.delete({ where: { id } });
  },
};
