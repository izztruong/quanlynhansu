import { z } from 'zod';

export const evaluationSectionSchema = z.enum([
  'RECENT_TEST',
  'MANAGER_REVIEW',
  'SUPERVISOR_REVIEW',
  'SURPRISE_INSPECTION',
  'DIRECT_INTERVIEW',
  'STORE_ENGAGEMENT',
]);

export const createEvaluationSchema = z.object({
  employeeId: z.string().min(1, 'Thiếu nhân viên'),
  shiftsWorkedInMonth: z.number().int().optional(),
  lateMinutesInMonth: z.number().int().optional(),
  shiftChangeCount: z.number().int().optional(),
  missedCheckInOutCount: z.number().int().optional(),
  disciplinaryReportCount: z.number().int().optional(),
  recentTestNote: z.string().optional(),
  managerReviewText: z.string().optional(),
  supervisorReviewText: z.string().optional(),
  surpriseInspectionText: z.string().optional(),
  interviewText: z.string().optional(),
  storeEngagementText: z.string().optional(),
  attachments: z
    .array(
      z.object({
        section: evaluationSectionSchema,
        type: z.enum(['IMAGE', 'VIDEO']),
        key: z.string().min(1),
      })
    )
    .optional(),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
