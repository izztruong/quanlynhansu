import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Tên chi nhánh không được để trống'),
  address: z.string().optional(),
  wifiSsid: z.string().optional(),
  wifiBssid: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
