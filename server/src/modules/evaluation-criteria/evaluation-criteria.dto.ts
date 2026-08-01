import { z } from 'zod';

export const evaluationSectionSchema = z.enum([
  'WORK_ATTITUDE',
  'PROFESSIONAL_COMPETENCE',
  'TEAM_ENGAGEMENT',
]);

export const createEvaluationCriteriaSchema = z.object({
  section: evaluationSectionSchema,
  name: z.string().min(1, 'Tên tiêu chí không được để trống'),
  inputType: z.enum(['NUMBER', 'TEXT']),
  allowAttachment: z.boolean().optional(),
  order: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateEvaluationCriteriaSchema = createEvaluationCriteriaSchema.partial();

export type CreateEvaluationCriteriaInput = z.infer<typeof createEvaluationCriteriaSchema>;
export type UpdateEvaluationCriteriaInput = z.infer<typeof updateEvaluationCriteriaSchema>;
