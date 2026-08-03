import { z } from 'zod';

export const createEvaluationSchema = z.object({
  employeeId: z.string().min(1, 'Thiếu nhân viên'),
  answers: z
    .array(
      z.object({
        criteriaId: z.string().min(1),
        numberValue: z.number().optional(),
        textValue: z.string().optional(),
      })
    )
    .optional(),
  attachments: z
    .array(
      z.object({
        criteriaId: z.string().min(1),
        type: z.enum(['IMAGE', 'VIDEO']),
        key: z.string().min(1),
      })
    )
    .optional(),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
