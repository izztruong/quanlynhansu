import type { Request, Response } from 'express';
import { getAccess } from '@/common/permissions';
import { positionsService } from './positions.service';
import { createPositionSchema, updatePositionSchema } from './positions.dto';

export const positionsController = {
  async list(_req: Request, res: Response) {
    const positions = await positionsService.list();
    res.json({ data: positions });
  },

  async getById(req: Request, res: Response) {
    const position = await positionsService.getById(req.params.id);
    res.json({ data: position });
  },

  async create(req: Request, res: Response) {
    const input = createPositionSchema.parse(req.body);
    const { permissions } = await getAccess(req);
    const position = await positionsService.create(input, permissions);
    res.status(201).json({ data: position });
  },

  async update(req: Request, res: Response) {
    const input = updatePositionSchema.parse(req.body);
    const { permissions } = await getAccess(req);
    const position = await positionsService.update(req.params.id, input, permissions);
    res.json({ data: position });
  },

  async remove(req: Request, res: Response) {
    await positionsService.remove(req.params.id);
    res.status(204).send();
  },
};
