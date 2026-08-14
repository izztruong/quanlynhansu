import { z } from 'zod';

// Các ô chữ dùng .nullish(): bỏ trống một ô trên giao diện gửi lên null,
// còn không đụng tới thì không có khoá — cả hai đều hợp lệ.
const sessionSchema = z.object({
  sessionNumber: z.number().int().positive(),
  sessionDate: z.string().nullish(),
  learnedContent: z.string().nullish(),
  assignedTasks: z.string().nullish(),
  evalAppearance: z.string().nullish(),
  evalCommunication: z.string().nullish(),
  evalPractice: z.string().nullish(),
});

// criteriaId có thể null nếu tiêu chí gốc đã bị xoá; tên/điểm tối đa vẫn
// được chụp lại nên phiếu cũ đọc được bình thường.
const scoreSchema = z.object({
  criteriaId: z.string().nullish(),
  groupName: z.string().min(1),
  criteriaName: z.string().min(1),
  maxScore: z.number().int().positive(),
  score: z.number().int().min(0, 'Điểm không được âm'),
  note: z.string().nullish(),
});

export const createTrainingLogSchema = z.object({
  employeeId: z.string().min(1, 'Thiếu nhân viên'),
  branchId: z.string().min(1, 'Thiếu cơ sở'),
  departmentId: z.string().min(1, 'Thiếu bộ phận học việc'),
  mentorId: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).optional(),
  overallOpinion: z.string().nullish(),
  sessions: z.array(sessionSchema).optional(),
  scores: z.array(scoreSchema).optional(),
});

export const updateTrainingLogSchema = createTrainingLogSchema.partial();

export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;
export type UpdateTrainingLogInput = z.infer<typeof updateTrainingLogSchema>;
