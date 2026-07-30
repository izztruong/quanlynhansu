import type { Request, Response } from 'express';
import { departmentsService } from './departments.service';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './departments.dto';

export const departmentsController = {
  async list(_req: Request, res: Response) {
    const departments = await departmentsService.list();
    res.json({ data: departments });
  },

  async getById(req: Request, res: Response) {
    const department = await departmentsService.getById(req.params.id);
    res.json({ data: department });
  },

  async create(req: Request, res: Response) {
    const input = createDepartmentSchema.parse(req.body);
    const department = await departmentsService.create(input);
    res.status(201).json({ data: department });
  },

  async update(req: Request, res: Response) {
    const input = updateDepartmentSchema.parse(req.body);
    const department = await departmentsService.update(req.params.id, input);
    res.json({ data: department });
  },

  async remove(req: Request, res: Response) {
    await departmentsService.remove(req.params.id);
    res.status(204).send();
  },
};
