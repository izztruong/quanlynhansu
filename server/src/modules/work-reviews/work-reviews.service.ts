import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { EmployeeScopeWhere } from '@/common/data-scope';
import type { CreateWorkReviewInput, UpdateWorkReviewInput } from './work-reviews.dto';

const include = {
  employee: { include: { branch: true, department: true, position: true, level: true } },
  reviewer: true,
  createdBy: true,
  notes: { orderBy: { order: 'asc' } },
} as const;

function toDate(value?: string | null) {
  if (value === null) return null;
  return value ? new Date(value) : undefined;
}

// Bỏ ghi chú rỗng: mục nào quản lý không viết gì thì không lưu dòng trống.
function usableNotes(notes: CreateWorkReviewInput['notes']) {
  return (notes ?? [])
    .filter((n) => (n.content ?? '').trim() !== '')
    .map((n, i) => ({
      sectionId: n.sectionId ?? null,
      sectionName: n.sectionName,
      content: n.content ?? '',
      order: n.order ?? i,
    }));
}

export const workReviewsService = {
  list(employeeId?: string, scope: EmployeeScopeWhere = {}) {
    return prisma.workReview.findMany({
      where: { ...(employeeId ? { employeeId } : {}), ...scope },
      orderBy: [{ weekStartDate: 'desc' }, { createdAt: 'desc' }],
      include,
    });
  },

  // Phạm vi trộn thẳng vào where nên phiếu ngoài quán trả 404 chứ không 403 —
  // vừa chặn, vừa không hé lộ phiếu đó có tồn tại hay không.
  async getById(id: string, scope: EmployeeScopeWhere = {}) {
    const review = await prisma.workReview.findFirst({ where: { id, ...scope }, include });
    if (!review) throw new NotFoundError('Không tìm thấy phiếu đánh giá tuần');
    return review;
  },

  getLatestForEmployee(employeeId: string, scope: EmployeeScopeWhere = {}) {
    return prisma.workReview.findFirst({
      where: { employeeId, ...scope },
      orderBy: [{ weekStartDate: 'desc' }, { createdAt: 'desc' }],
      include,
    });
  },

  create({ notes, weekStartDate, ...rest }: CreateWorkReviewInput, authorId?: string) {
    return prisma.workReview.create({
      data: {
        ...rest,
        weekStartDate: new Date(weekStartDate),
        createdById: authorId,
        notes: { create: usableNotes(notes) },
      },
      include,
    });
  },

  // Ghi chú thay trọn bộ: chúng chỉ là giá trị con của phiếu nên xoá rồi
  // tạo lại đơn giản và chắc chắn hơn so từng dòng.
  async update(
    id: string,
    { notes, weekStartDate, ...rest }: UpdateWorkReviewInput,
    scope: EmployeeScopeWhere = {}
  ) {
    await this.getById(id, scope);

    return prisma.$transaction(async (tx) => {
      if (notes) {
        await tx.workReviewNote.deleteMany({ where: { reviewId: id } });
        await tx.workReviewNote.createMany({
          data: usableNotes(notes).map((n) => ({ ...n, reviewId: id })),
        });
      }

      return tx.workReview.update({
        where: { id },
        data: { ...rest, weekStartDate: toDate(weekStartDate) ?? undefined },
        include,
      });
    });
  },

  async remove(id: string, scope: EmployeeScopeWhere = {}) {
    await this.getById(id, scope);
    // notes có onDelete: Cascade nên tự dọn theo.
    await prisma.workReview.delete({ where: { id } });
  },
};
