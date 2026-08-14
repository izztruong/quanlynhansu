import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { changePasswordSchema, loginSchema } from './auth.dto';
import { AUTH_COOKIE_NAME } from '@/config/auth';
import { NotFoundError } from '@/common/errors';
import { resolvePermissions } from '@/common/permissions';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';
// In production the client (Vercel) and API (Render) live on different
// domains, so the cookie must be sent cross-site — that requires
// sameSite:'none', which browsers only honor when secure:true is also set.
// Locally both run on localhost, where 'lax' + non-secure is what works.
const cookieOptions = {
  httpOnly: true,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProduction,
};

export const authController = {
  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { token, employee } = await authService.login({
      ...input,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE_MS });
    // Mobile clients (React Native) can't rely on browser cookies the same
    // way web does — they store this token themselves and send it back as
    // an Authorization: Bearer header (see requireAuth).
    res.json({ data: employee, token });
  },

  async logout(req: Request, res: Response) {
    if (req.user) {
      await authService.logout(req.user.sessionId);
    }
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
    res.status(204).send();
  },

  async me(req: Request, res: Response) {
    const employee = await authService.getById(req.user!.employeeId);
    if (!employee) throw new NotFoundError('Không tìm thấy tài khoản');
    // Kèm quyền để web ẩn bớt menu/nút; việc chặn thật vẫn ở requirePermission.
    const { isSystem, permissions } = await resolvePermissions(req.user!.employeeId);
    res.json({ data: { ...employee, isSystem, permissions } });
  },

  async changePassword(req: Request, res: Response) {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.employeeId, input);
    res.status(204).send();
  },

  async listSessions(req: Request, res: Response) {
    const sessions = await authService.listSessions(req.user!.employeeId);
    res.json({
      data: sessions.map((s) => ({ ...s, isCurrent: s.id === req.user!.sessionId })),
    });
  },

  async revokeSession(req: Request, res: Response) {
    await authService.revokeSession(req.user!.employeeId, req.params.id);
    res.status(204).send();
  },
};
