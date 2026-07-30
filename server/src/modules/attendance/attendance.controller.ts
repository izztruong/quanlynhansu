import type { Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { checkInSchema, listAttendanceQuerySchema } from './attendance.dto';

export const attendanceController = {
  async list(req: Request, res: Response) {
    const query = listAttendanceQuerySchema.parse(req.query);
    const attendance = await attendanceService.list(query);
    res.json({ data: attendance });
  },

  async today(req: Request, res: Response) {
    const attendance = await attendanceService.getTodayForEmployee(req.user!.employeeId);
    res.json({ data: attendance });
  },

  async checkIn(req: Request, res: Response) {
    const input = checkInSchema.parse(req.body);
    const attendance = await attendanceService.checkIn(req.user!.employeeId, input);
    res.status(201).json({ data: attendance });
  },

  async checkOut(req: Request, res: Response) {
    const attendance = await attendanceService.checkOut(req.user!.employeeId);
    res.json({ data: attendance });
  },
};
