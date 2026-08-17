import type { Request, Response } from 'express';
import { assertEmployeeInScope, employeeRelationFilter } from '@/common/data-scope';
import { trainingLogsService } from './training-logs.service';
import { buildTrainingLogPdf } from './training-logs.pdf';
import { createTrainingLogSchema, updateTrainingLogSchema } from './training-logs.dto';

// Bỏ dấu tiếng Việt cho tên file tải về — header Content-Disposition chỉ an
// toàn với ASCII, tên có dấu sẽ bị trình duyệt cắt hoặc hiện sai.
function toAsciiFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const trainingLogsController = {
  async list(req: Request, res: Response) {
    const employeeId = typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined;
    const logs = await trainingLogsService.list(employeeId, await employeeRelationFilter(req));
    res.json({ data: logs });
  },

  async getById(req: Request, res: Response) {
    const log = await trainingLogsService.getById(req.params.id, await employeeRelationFilter(req));
    res.json({ data: log });
  },

  async create(req: Request, res: Response) {
    const input = createTrainingLogSchema.parse(req.body);
    // Nhân viên đích nằm ở body chứ không phải params, nên phải chốt riêng.
    await assertEmployeeInScope(req, input.employeeId);
    const log = await trainingLogsService.create(input, req.user?.employeeId);
    res.status(201).json({ data: log });
  },

  async update(req: Request, res: Response) {
    const input = updateTrainingLogSchema.parse(req.body);
    if (input.employeeId) await assertEmployeeInScope(req, input.employeeId);
    const log = await trainingLogsService.update(
      req.params.id,
      input,
      await employeeRelationFilter(req)
    );
    res.json({ data: log });
  },

  async remove(req: Request, res: Response) {
    await trainingLogsService.remove(req.params.id, await employeeRelationFilter(req));
    res.status(204).send();
  },

  // Route riêng, không đi qua getById của các đường khác — quên chỗ này là
  // tải được PDF của nhân viên quán khác.
  async exportPdf(req: Request, res: Response) {
    const log = await trainingLogsService.getById(req.params.id, await employeeRelationFilter(req));
    const pdf = await buildTrainingLogPdf(log);
    const fileName = `nhat-ky-hoc-viec-${toAsciiFileName(log.employee.name)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdf);
  },
};
