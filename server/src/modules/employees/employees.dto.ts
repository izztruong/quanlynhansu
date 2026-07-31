import { z } from 'zod';

export const createEmployeeSchema = z.object({
  code: z.string().min(1, 'Thiếu mã nhân viên'),
  name: z.string().min(1, 'Tên nhân viên không được để trống'),
  email: z.string().email('Email không hợp lệ').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  branchId: z.string().min(1, 'Thiếu chi nhánh'),
  departmentId: z.string().min(1, 'Thiếu bộ phận'),
  positionId: z.string().min(1, 'Thiếu chức vụ'),
  levelId: z.string().optional(),
  employeeType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  salaryRate: z.number().int().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  idNumber: z.string().optional(),
  idIssueDate: z.string().optional(),
  idIssuePlace: z.string().optional(),
  idFrontImageKey: z.string().optional(),
  idBackImageKey: z.string().optional(),
  hireDate: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const changeTypeSchema = z.object({
  employeeType: z.enum(['FULL_TIME', 'PART_TIME']),
  salaryRate: z.number().int().optional(),
});

export const changePositionSchema = z.object({
  positionId: z.string().min(1, 'Thiếu chức vụ'),
});

export const changeBranchSchema = z.object({
  branchId: z.string().min(1, 'Thiếu chi nhánh'),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
