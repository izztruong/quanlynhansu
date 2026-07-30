import { z } from 'zod';

export const listAttendanceQuerySchema = z.object({
  from: z.string().min(1, 'Thiếu ngày bắt đầu'),
  to: z.string().min(1, 'Thiếu ngày kết thúc'),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
});

export const checkInSchema = z.object({
  shiftId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  wifiSsid: z.string().optional(),
  wifiBssid: z.string().optional(),
});

export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
