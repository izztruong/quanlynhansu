import type { Request, Response } from 'express';
import { newsService } from './news.service';
import { createNewsSchema, updateNewsSchema } from './news.dto';

export const newsController = {
  async list(_req: Request, res: Response) {
    const news = await newsService.list();
    res.json({ data: news });
  },

  async getById(req: Request, res: Response) {
    const news = await newsService.getById(req.params.id);
    res.json({ data: news });
  },

  async create(req: Request, res: Response) {
    const input = createNewsSchema.parse(req.body);
    const news = await newsService.create(input);
    res.status(201).json({ data: news });
  },

  async update(req: Request, res: Response) {
    const input = updateNewsSchema.parse(req.body);
    const news = await newsService.update(req.params.id, input);
    res.json({ data: news });
  },

  async remove(req: Request, res: Response) {
    await newsService.remove(req.params.id);
    res.status(204).send();
  },
};
