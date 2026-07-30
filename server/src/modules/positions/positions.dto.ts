import { z } from 'zod';

export const createPositionSchema = z.object({
  name: z.string().min(1, 'Tên chức vụ không được để trống'),
  description: z.string().optional(),
  accessScopes: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updatePositionSchema = createPositionSchema.partial();

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
