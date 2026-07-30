import { z } from 'zod';

export const createLevelSchema = z.object({
  name: z.string().min(1, 'Tên level không được để trống'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateLevelSchema = createLevelSchema.partial();

export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;
