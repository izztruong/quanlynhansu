import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  thumbnailUrl: z.string().optional(),
  content: z.string().optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
