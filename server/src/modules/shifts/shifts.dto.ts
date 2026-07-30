import { z } from 'zod';

export const createShiftSchema = z.object({
  name: z.string().min(1, 'Tên ca làm việc không được để trống'),
  startTime: z.string().min(1, 'Thiếu giờ bắt đầu'),
  endTime: z.string().min(1, 'Thiếu giờ kết thúc'),
  appliesToAllDepartments: z.boolean().optional(),
  departmentIds: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateShiftSchema = createShiftSchema.partial();

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
