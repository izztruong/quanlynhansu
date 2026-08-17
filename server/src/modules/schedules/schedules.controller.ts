import type { Request, Response } from 'express';
import { assertEmployeeInScope, employeeRelationFilter } from '@/common/data-scope';
import { schedulesService } from './schedules.service';
import { createScheduleSchema, listSchedulesQuerySchema } from './schedules.dto';

export const schedulesController = {
  async list(req: Request, res: Response) {
    const query = listSchedulesQuerySchema.parse(req.query);
    const schedules = await schedulesService.list(query, await employeeRelationFilter(req));
    res.json({ data: schedules });
  },

  async create(req: Request, res: Response) {
    const input = createScheduleSchema.parse(req.body);
    await assertEmployeeInScope(req, input.employeeId);
    const schedule = await schedulesService.create(input);
    res.status(201).json({ data: schedule });
  },

  async remove(req: Request, res: Response) {
    await schedulesService.remove(req.params.id, await employeeRelationFilter(req));
    res.status(204).send();
  },
};
