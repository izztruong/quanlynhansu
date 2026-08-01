import type { Request, Response } from 'express';
import { evaluationCriteriaService } from './evaluation-criteria.service';
import {
  createEvaluationCriteriaSchema,
  updateEvaluationCriteriaSchema,
} from './evaluation-criteria.dto';

export const evaluationCriteriaController = {
  async list(_req: Request, res: Response) {
    const criteria = await evaluationCriteriaService.list();
    res.json({ data: criteria });
  },

  async getById(req: Request, res: Response) {
    const criteria = await evaluationCriteriaService.getById(req.params.id);
    res.json({ data: criteria });
  },

  async create(req: Request, res: Response) {
    const input = createEvaluationCriteriaSchema.parse(req.body);
    const criteria = await evaluationCriteriaService.create(input);
    res.status(201).json({ data: criteria });
  },

  async update(req: Request, res: Response) {
    const input = updateEvaluationCriteriaSchema.parse(req.body);
    const criteria = await evaluationCriteriaService.update(req.params.id, input);
    res.json({ data: criteria });
  },

  async remove(req: Request, res: Response) {
    await evaluationCriteriaService.remove(req.params.id);
    res.status(204).send();
  },
};
