import { z } from 'zod';

export const createWorkReviewSectionSchema = z.object({
  name: z.string().min(1, 'Tên mục nhận xét không được để trống'),
  order: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateWorkReviewSectionSchema = createWorkReviewSectionSchema.partial();

export type CreateWorkReviewSectionInput = z.infer<typeof createWorkReviewSectionSchema>;
export type UpdateWorkReviewSectionInput = z.infer<typeof updateWorkReviewSectionSchema>;
