import type { Request, Response } from 'express';
import { evaluationsService } from './evaluations.service';
import { createEvaluationSchema } from './evaluations.dto';

export const evaluationsController = {
  async create(req: Request, res: Response) {
    const input = createEvaluationSchema.parse(req.body);
    const form = await evaluationsService.create(input);
    res.status(201).json({ data: form });
  },

  async list(_req: Request, res: Response) {
    const forms = await evaluationsService.list();
    res.json({ data: forms });
  },

  async getById(req: Request, res: Response) {
    const form = await evaluationsService.getById(req.params.id);
    res.json({ data: form });
  },

  async listForEmployee(req: Request, res: Response) {
    const forms = await evaluationsService.listForEmployee(req.params.employeeId);
    res.json({ data: forms });
  },

  async latestForEmployee(req: Request, res: Response) {
    const form = await evaluationsService.getLatestForEmployee(req.params.employeeId);
    res.json({ data: form });
  },
};
