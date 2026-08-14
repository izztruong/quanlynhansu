import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, AUTH_COOKIE_NAME } from '@/config/auth';
import { prisma } from '@/config/prisma';
import type { AuthTokenPayload } from '@/modules/auth/auth.service';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length)
    : undefined;
  const token = req.cookies?.[AUTH_COOKIE_NAME] ?? bearerToken;
  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập' });
    return;
  }

  let payload: AuthTokenPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    return;
  }

  // Tokens issued before Session tracking existed have no sessionId — treat
  // that the same as a revoked session rather than querying with `undefined`
  // (Prisma throws on a missing unique-filter value, which would otherwise
  // crash this middleware instead of failing gracefully with a 401).
  if (!payload.sessionId) {
    res.status(401).json({ message: 'Phiên đăng nhập đã cũ, vui lòng đăng nhập lại' });
    return;
  }

  // The token signature alone can't be revoked before it expires, so a
  // logged-out/removed device must be checked against a live session row —
  // this is what makes "đăng xuất từ xa" actually take effect immediately.
  try {
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } });
    if (!session) {
      res.status(401).json({ message: 'Phiên đăng nhập đã bị đăng xuất' });
      return;
    }
    prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
      .catch(() => {});
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    return;
  }

  req.user = payload;
  next();
}

