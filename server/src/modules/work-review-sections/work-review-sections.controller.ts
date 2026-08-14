import type { Request, Response } from 'express';
import { workReviewSectionsService } from './work-review-sections.service';
import {
  createWorkReviewSectionSchema,
  updateWorkReviewSectionSchema,
} from './work-review-sections.dto';

export const workReviewSectionsController = {
  async list(_req: Request, res: Response) {
    const sections = await workReviewSectionsService.list();
    res.json({ data: sections });
  },

  async create(req: Request, res: Response) {
    const input = createWorkReviewSectionSchema.parse(req.body);
    const section = await workReviewSectionsService.create(input);
    res.status(201).json({ data: section });
  },

  async update(req: Request, res: Response) {
    const input = updateWorkReviewSectionSchema.parse(req.body);
    const section = await workReviewSectionsService.update(req.params.id, input);
    res.json({ data: section });
  },

  async remove(req: Request, res: Response) {
    await workReviewSectionsService.remove(req.params.id);
    res.status(204).send();
  },
};
