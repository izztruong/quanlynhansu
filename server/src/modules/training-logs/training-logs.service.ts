import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import type { EmployeeScopeWhere } from '@/common/data-scope';
import type { CreateTrainingLogInput, UpdateTrainingLogInput } from './training-logs.dto';

const include = {
  employee: { include: { branch: true, department: true, position: true, level: true } },
  branch: true,
  department: true,
  mentor: true,
  createdBy: true,
  sessions: { orderBy: { sessionNumber: 'asc' } },
  scores: true,
} as const;

// null nghĩa là "xoá ngày này", undefined nghĩa là "không đụng tới" — giữ
// đúng phân biệt đó thay vì gộp cả hai thành undefined.
function toDate(value?: string | null) {
  if (value === null) return null;
  return value ? new Date(value) : undefined;
}

export const trainingLogsService = {
  list(employeeId?: string, scope: EmployeeScopeWhere = {}) {
    return prisma.trainingLog.findMany({
      where: { ...(employeeId ? { employeeId } : {}), ...scope },
      orderBy: { createdAt: 'desc' },
      include,
    });
  },

  // Phạm vi trộn thẳng vào where nên phiếu ngoài quán trả 404 chứ không 403 —
  // vừa chặn, vừa không hé lộ phiếu đó có tồn tại hay không.
  async getById(id: string, scope: EmployeeScopeWhere = {}) {
    const log = await prisma.trainingLog.findFirst({ where: { id, ...scope }, include });
    if (!log) throw new NotFoundError('Không tìm thấy phiếu học việc');
    return log;
  },

  create({ sessions, scores, startDate, endDate, ...rest }: CreateTrainingLogInput, authorId?: string) {
    return prisma.trainingLog.create({
      data: {
        ...rest,
        startDate: toDate(startDate),
        endDate: toDate(endDate),
        createdById: authorId,
        sessions: sessions?.length
          ? { create: sessions.map((s) => ({ ...s, sessionDate: toDate(s.sessionDate) })) }
          : undefined,
        scores: scores?.length ? { create: scores } : undefined,
      },
      include,
    });
  },

  // Buổi và điểm được thay trọn bộ: chúng chỉ là giá trị con của phiếu, nên
  // xoá rồi tạo lại đơn giản và chắc chắn hơn là so từng dòng một.
  async update(
    id: string,
    { sessions, scores, startDate, endDate, ...rest }: UpdateTrainingLogInput,
    scope: EmployeeScopeWhere = {}
  ) {
    await this.getById(id, scope);

    return prisma.$transaction(async (tx) => {
      if (sessions) {
        await tx.trainingSession.deleteMany({ where: { trainingLogId: id } });
        await tx.trainingSession.createMany({
          data: sessions.map((s) => ({
            ...s,
            sessionDate: toDate(s.sessionDate),
            trainingLogId: id,
          })),
        });
      }

      if (scores) {
        await tx.trainingScore.deleteMany({ where: { trainingLogId: id } });
        await tx.trainingScore.createMany({
          data: scores.map((s) => ({ ...s, trainingLogId: id })),
        });
      }

      return tx.trainingLog.update({
        where: { id },
        data: { ...rest, startDate: toDate(startDate), endDate: toDate(endDate) },
        include,
      });
    });
  },

  async remove(id: string, scope: EmployeeScopeWhere = {}) {
    await this.getById(id, scope);
    // sessions/scores có onDelete: Cascade nên tự dọn theo.
    await prisma.trainingLog.delete({ where: { id } });
  },
};
