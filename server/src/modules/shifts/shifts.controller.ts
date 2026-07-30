import type { Request, Response } from 'express';
import { shiftsService } from './shifts.service';
import { createShiftSchema, updateShiftSchema } from './shifts.dto';

export const shiftsController = {
  async list(_req: Request, res: Response) {
    const shifts = await shiftsService.list();
    res.json({ data: shifts });
  },

  async getById(req: Request, res: Response) {
    const shift = await shiftsService.getById(req.params.id);
    res.json({ data: shift });
  },

  async create(req: Request, res: Response) {
    const input = createShiftSchema.parse(req.body);
    const shift = await shiftsService.create(input);
    res.status(201).json({ data: shift });
  },

  async update(req: Request, res: Response) {
    const input = updateShiftSchema.parse(req.body);
    const shift = await shiftsService.update(req.params.id, input);
    res.json({ data: shift });
  },

  async remove(req: Request, res: Response) {
    await shiftsService.remove(req.params.id);
    res.status(204).send();
  },
};
