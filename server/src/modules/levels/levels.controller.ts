import type { Request, Response } from 'express';
import { levelsService } from './levels.service';
import { createLevelSchema, updateLevelSchema } from './levels.dto';

export const levelsController = {
  async list(_req: Request, res: Response) {
    const levels = await levelsService.list();
    res.json({ data: levels });
  },

  async getById(req: Request, res: Response) {
    const level = await levelsService.getById(req.params.id);
    res.json({ data: level });
  },

  async create(req: Request, res: Response) {
    const input = createLevelSchema.parse(req.body);
    const level = await levelsService.create(input);
    res.status(201).json({ data: level });
  },

  async update(req: Request, res: Response) {
    const input = updateLevelSchema.parse(req.body);
    const level = await levelsService.update(req.params.id, input);
    res.json({ data: level });
  },

  async remove(req: Request, res: Response) {
    await levelsService.remove(req.params.id);
    res.status(204).send();
  },
};
