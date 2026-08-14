import { z } from 'zod';

const noteSchema = z.object({
  sectionId: z.string().nullish(),
  sectionName: z.string().min(1),
  content: z.string().nullish(),
  order: z.number().int().optional(),
});

export const createWorkReviewSchema = z.object({
  employeeId: z.string().min(1, 'Thiếu nhân viên'),
  weekStartDate: z.string().min(1, 'Thiếu tuần đánh giá'),
  reviewerId: z.string().nullish(),
  score: z.number().min(0, 'Điểm không được âm'),
  maxScore: z.number().int().positive().optional(),
  notes: z.array(noteSchema).optional(),
});

export const updateWorkReviewSchema = createWorkReviewSchema.partial();

export type CreateWorkReviewInput = z.infer<typeof createWorkReviewSchema>;
export type UpdateWorkReviewInput = z.infer<typeof updateWorkReviewSchema>;
