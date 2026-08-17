import type { Request, Response } from 'express';
import { assertEmployeeInScope, employeeRelationFilter } from '@/common/data-scope';
import { evaluationsService } from './evaluations.service';
import { createEvaluationSchema } from './evaluations.dto';

export const evaluationsController = {
  async create(req: Request, res: Response) {
    const input = createEvaluationSchema.parse(req.body);
    // Nhân viên đích nằm ở body chứ không phải params, nên phải chốt riêng.
    await assertEmployeeInScope(req, input.employeeId);
    const form = await evaluationsService.create(input);
    res.status(201).json({ data: form });
  },

  async list(req: Request, res: Response) {
    const forms = await evaluationsService.list(await employeeRelationFilter(req));
    res.json({ data: forms });
  },

  async getById(req: Request, res: Response) {
    const form = await evaluationsService.getById(req.params.id, await employeeRelationFilter(req));
    res.json({ data: form });
  },

  async listForEmployee(req: Request, res: Response) {
    const forms = await evaluationsService.listForEmployee(
      req.params.employeeId,
      await employeeRelationFilter(req)
    );
    res.json({ data: forms });
  },

  async latestForEmployee(req: Request, res: Response) {
    const form = await evaluationsService.getLatestForEmployee(
      req.params.employeeId,
      await employeeRelationFilter(req)
    );
    res.json({ data: form });
  },

  async remove(req: Request, res: Response) {
    await evaluationsService.remove(req.params.id, await employeeRelationFilter(req));
    res.status(204).send();
  },
};
