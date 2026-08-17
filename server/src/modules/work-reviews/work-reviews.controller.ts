import type { Request, Response } from 'express';
import { assertEmployeeInScope, employeeRelationFilter } from '@/common/data-scope';
import { workReviewsService } from './work-reviews.service';
import { createWorkReviewSchema, updateWorkReviewSchema } from './work-reviews.dto';

export const workReviewsController = {
  async list(req: Request, res: Response) {
    const employeeId = typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined;
    const reviews = await workReviewsService.list(employeeId, await employeeRelationFilter(req));
    res.json({ data: reviews });
  },

  async getById(req: Request, res: Response) {
    const review = await workReviewsService.getById(req.params.id, await employeeRelationFilter(req));
    res.json({ data: review });
  },

  async latestForEmployee(req: Request, res: Response) {
    const review = await workReviewsService.getLatestForEmployee(
      req.params.employeeId,
      await employeeRelationFilter(req)
    );
    res.json({ data: review });
  },

  async create(req: Request, res: Response) {
    const input = createWorkReviewSchema.parse(req.body);
    // Nhân viên đích nằm ở body chứ không phải params, nên phải chốt riêng.
    await assertEmployeeInScope(req, input.employeeId);
    const review = await workReviewsService.create(input, req.user?.employeeId);
    res.status(201).json({ data: review });
  },

  async update(req: Request, res: Response) {
    const input = updateWorkReviewSchema.parse(req.body);
    // Sửa được employeeId nghĩa là chuyển được phiếu sang người khác — chốt
    // luôn đích đến, không chỉ phiếu nguồn.
    if (input.employeeId) await assertEmployeeInScope(req, input.employeeId);
    const review = await workReviewsService.update(
      req.params.id,
      input,
      await employeeRelationFilter(req)
    );
    res.json({ data: review });
  },

  async remove(req: Request, res: Response) {
    await workReviewsService.remove(req.params.id, await employeeRelationFilter(req));
    res.status(204).send();
  },
};
