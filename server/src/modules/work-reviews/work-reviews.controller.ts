import type { Request, Response } from 'express';
import { workReviewsService } from './work-reviews.service';
import { createWorkReviewSchema, updateWorkReviewSchema } from './work-reviews.dto';

export const workReviewsController = {
  async list(req: Request, res: Response) {
    const employeeId = typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined;
    const reviews = await workReviewsService.list(employeeId);
    res.json({ data: reviews });
  },

  async getById(req: Request, res: Response) {
    const review = await workReviewsService.getById(req.params.id);
    res.json({ data: review });
  },

  async latestForEmployee(req: Request, res: Response) {
    const review = await workReviewsService.getLatestForEmployee(req.params.employeeId);
    res.json({ data: review });
  },

  async create(req: Request, res: Response) {
    const input = createWorkReviewSchema.parse(req.body);
    const review = await workReviewsService.create(input, req.user?.employeeId);
    res.status(201).json({ data: review });
  },

  async update(req: Request, res: Response) {
    const input = updateWorkReviewSchema.parse(req.body);
    const review = await workReviewsService.update(req.params.id, input);
    res.json({ data: review });
  },

  async remove(req: Request, res: Response) {
    await workReviewsService.remove(req.params.id);
    res.status(204).send();
  },
};
