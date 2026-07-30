import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  appliesToAllBranches: z.boolean().optional(),
  branchIds: z.array(z.string()).optional(),
  appliesToAllDepartments: z.boolean().optional(),
  departmentIds: z.array(z.string()).optional(),
  employeeGroupScope: z.enum(['ALL', 'FULL_TIME', 'PART_TIME', 'SPECIFIC']).optional(),
  specificEmployeeIds: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateNotificationSchema = createNotificationSchema.partial();

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
