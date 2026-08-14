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
    // Zod schemas throughout the app already carry specific Vietnamese
    // messages per field (e.g. "Thiếu mã nhân viên", "Email không hợp lệ") —
    // surface the first one instead of a blanket "invalid data" message.
    const firstIssue = err.issues[0];
    res.status(400).json({
      message: firstIssue?.message || 'Dữ liệu không hợp lệ',
      issues: err.issues,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // body-parser ném SyntaxError kèm statusCode 400 khi JSON gửi lên sai
  // định dạng — không bắt thì rơi xuống 500 và rất khó lần ra nguyên nhân.
  if (err instanceof SyntaxError && 'statusCode' in err && err.statusCode === 400) {
    res.status(400).json({ message: 'Dữ liệu gửi lên không phải JSON hợp lệ' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = err.meta?.target;
    const field = Array.isArray(target) ? target[0] : undefined;
    const label = (field && FIELD_LABELS[field]) || 'Giá trị này';
    res.status(409).json({ message: `${label} đã được sử dụng, vui lòng chọn giá trị khác` });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    res.status(409).json({ message: 'Không thể xóa vì dữ liệu này đang được sử dụng' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
}
