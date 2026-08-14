import { z } from 'zod';

export const createTrainingCriteriaGroupSchema = z.object({
  departmentId: z.string().min(1, 'Thiếu bộ phận'),
  name: z.string().min(1, 'Tên nhóm tiêu chí không được để trống'),
  order: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateTrainingCriteriaGroupSchema = createTrainingCriteriaGroupSchema.partial();

export const createTrainingCriteriaSchema = z.object({
  groupId: z.string().min(1, 'Thiếu nhóm tiêu chí'),
  name: z.string().min(1, 'Tên tiêu chí không được để trống'),
  maxScore: z.number().int().positive('Điểm tối đa phải lớn hơn 0'),
  order: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateTrainingCriteriaSchema = createTrainingCriteriaSchema.partial();

export type CreateTrainingCriteriaGroupInput = z.infer<typeof createTrainingCriteriaGroupSchema>;
export type UpdateTrainingCriteriaGroupInput = z.infer<typeof updateTrainingCriteriaGroupSchema>;
export type CreateTrainingCriteriaInput = z.infer<typeof createTrainingCriteriaSchema>;
export type UpdateTrainingCriteriaInput = z.infer<typeof updateTrainingCriteriaSchema>;
