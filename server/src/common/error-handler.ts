import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from './errors';

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  code: 'Mã nhân viên',
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      issues: err.issues,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = err.meta?.target;
    const field = Array.isArray(target) ? target[0] : undefined;
    const label = (field && FIELD_LABELS[field]) || 'Giá trị này';
    res.status(409).json({ message: `${label} đã được sử dụng, vui lòng chọn giá trị khác` });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
}
