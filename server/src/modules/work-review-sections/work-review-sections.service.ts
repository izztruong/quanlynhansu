import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type {
  CreateWorkReviewSectionInput,
  UpdateWorkReviewSectionInput,
} from './work-review-sections.dto';

export const workReviewSectionsService = {
  list() {
    return prisma.workReviewSection.findMany({ orderBy: { order: 'asc' } });
  },

  async getById(id: string) {
    const section = await prisma.workReviewSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundError('Không tìm thấy mục nhận xét');
    return section;
  },

  create(data: CreateWorkReviewSectionInput) {
    return prisma.workReviewSection.create({ data });
  },

  async update(id: string, data: UpdateWorkReviewSectionInput) {
    await this.getById(id);
    return prisma.workReviewSection.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    // Ghi chú trên phiếu cũ giữ sectionName đã chụp nên vẫn đọc được sau
    // khi mục gốc bị xoá; sectionId chuyển thành null.
    await prisma.workReviewSection.delete({ where: { id } });
  },
};
