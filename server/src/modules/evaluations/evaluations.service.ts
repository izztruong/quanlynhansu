import { prisma } from '@/config/prisma';
import { NotFoundError } from '@/common/errors';
import { uploadsService } from '@/modules/uploads/uploads.service';
import type { CreateEvaluationInput } from './evaluations.dto';

const employeeInclude = {
  branch: true,
  department: true,
  position: true,
  level: true,
};

const include = {
  answers: { include: { criteria: true } },
  attachments: { include: { criteria: true } },
  employee: { include: employeeInclude },
};

// The R2 bucket is private, so each attachment key is only ever useful to a
// caller as a freshly signed URL — resolved on read, never persisted.
async function withAttachmentUrls<
  T extends { attachments: { key: string }[] },
>(form: T) {
  const attachments = await Promise.all(
    form.attachments.map(async (a) => ({ ...a, url: await uploadsService.getSignedUrl(a.key) }))
  );
  return { ...form, attachments };
}

export const evaluationsService = {
  create({ employeeId, answers, attachments }: CreateEvaluationInput) {
    return prisma.evaluationForm.create({
      data: {
        employeeId,
        answers: answers?.length ? { create: answers } : undefined,
        attachments: attachments?.length ? { create: attachments } : undefined,
      },
      include,
    });
  },

  // All forms across every employee, for the management page — attachment
  // signed URLs aren't resolved here since the list view only needs counts.
  list() {
    return prisma.evaluationForm.findMany({ orderBy: { createdAt: 'desc' }, include });
  },

  listForEmployee(employeeId: string) {
    return prisma.evaluationForm.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include,
    });
  },

  async getLatestForEmployee(employeeId: string) {
    const form = await prisma.evaluationForm.findFirst({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include,
    });
    if (!form) return null;
    return withAttachmentUrls(form);
  },

  async getById(id: string) {
    const form = await prisma.evaluationForm.findUnique({ where: { id }, include });
    if (!form) throw new NotFoundError('Không tìm thấy phiếu đánh giá');
    return withAttachmentUrls(form);
  },

  async remove(id: string) {
    const form = await prisma.evaluationForm.findUnique({
      where: { id },
      select: { attachments: { select: { key: true } } },
    });
    if (!form) throw new NotFoundError('Không tìm thấy phiếu đánh giá');

    // Cascade deletes the DB rows (answers + attachments); the R2 objects
    // themselves aren't covered by that, so clean them up best-effort here.
    await prisma.evaluationForm.delete({ where: { id } });
    await Promise.all(form.attachments.map((a) => uploadsService.deleteFile(a.key).catch(() => {})));
  },
};
