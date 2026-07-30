import { z } from 'zod';

export const listSchedulesQuerySchema = z.object({
  from: z.string().min(1, 'Thiếu ngày bắt đầu'),
  to: z.string().min(1, 'Thiếu ngày kết thúc'),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
});

export const createScheduleSchema = z.object({
  employeeId: z.string().min(1, 'Thiếu nhân viên'),
  shiftId: z.string().min(1, 'Thiếu ca làm việc'),
  date: z.string().min(1, 'Thiếu ngày'),
});

export type ListSchedulesQuery = z.infer<typeof listSchedulesQuerySchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
