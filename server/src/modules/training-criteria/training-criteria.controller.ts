import type { Request, Response } from 'express';
import { trainingCriteriaService } from './training-criteria.service';
import {
  createTrainingCriteriaGroupSchema,
  createTrainingCriteriaSchema,
  updateTrainingCriteriaGroupSchema,
  updateTrainingCriteriaSchema,
} from './training-criteria.dto';

export const trainingCriteriaController = {
  async listGroups(req: Request, res: Response) {
    const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
    const groups = await trainingCriteriaService.listGroups(departmentId);
    res.json({ data: groups });
  },

  async createGroup(req: Request, res: Response) {
    const input = createTrainingCriteriaGroupSchema.parse(req.body);
    const group = await trainingCriteriaService.createGroup(input);
    res.status(201).json({ data: group });
  },

  async updateGroup(req: Request, res: Response) {
    const input = updateTrainingCriteriaGroupSchema.parse(req.body);
    const group = await trainingCriteriaService.updateGroup(req.params.id, input);
    res.json({ data: group });
  },

  async removeGroup(req: Request, res: Response) {
    await trainingCriteriaService.removeGroup(req.params.id);
    res.status(204).send();
  },

  async createCriteria(req: Request, res: Response) {
    const input = createTrainingCriteriaSchema.parse(req.body);
    const criteria = await trainingCriteriaService.createCriteria(input);
    res.status(201).json({ data: criteria });
  },

  async updateCriteria(req: Request, res: Response) {
    const input = updateTrainingCriteriaSchema.parse(req.body);
    const criteria = await trainingCriteriaService.updateCriteria(req.params.id, input);
    res.json({ data: criteria });
  },

  async removeCriteria(req: Request, res: Response) {
    await trainingCriteriaService.removeCriteria(req.params.id);
    res.status(204).send();
  },
};
