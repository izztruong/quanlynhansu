import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/prisma';
import { JWT_SECRET, JWT_EXPIRES_IN } from '@/config/auth';
import { BadRequestError } from '@/common/errors';
import { isAdminScope } from '@/common/permissions';
import { summarizeUserAgent } from '@/common/user-agent';
import type { ChangePasswordInput, LoginInput } from './auth.dto';

const include = {
  branch: true,
  department: true,
  position: true,
  level: true,
};

export interface AuthTokenPayload {
  employeeId: string;
  isAdmin: boolean;
  sessionId: string;
}

const PLATFORM_SCOPE: Record<'web' | 'mobile', string> = {
  web: 'CMS',
  mobile: 'iPOS HRM',
};

const PLATFORM_DENIED_MESSAGE: Record<'web' | 'mobile', string> = {
  web: 'Tài khoản không có quyền truy cập trang quản trị web',
  mobile: 'Tài khoản không có quyền truy cập ứng dụng di động',
};

export const authService = {
  async login({
    email,
    password,
    platform,
    deviceInfo,
    userAgent,
    ipAddress,
  }: LoginInput & { userAgent?: string; ipAddress?: string }) {
    // passwordHash is globally omitted by default (see config/prisma.ts) —
    // opt back in just for this comparison, then strip it before returning.
    const employee = await prisma.employee.findUnique({
      where: { email },
      include,
      omit: { passwordHash: false },
    });

    if (!employee || !employee.passwordHash) {
      throw new BadRequestError('Email hoặc mật khẩu không đúng');
    }
    if (employee.status !== 'WORKING') {
      throw new BadRequestError('Tài khoản đã bị vô hiệu hoá');
    }

    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) {
      throw new BadRequestError('Email hoặc mật khẩu không đúng');
    }

    const scopes = employee.position.accessScopes;
    if (!scopes.includes(PLATFORM_SCOPE[platform])) {
      throw new BadRequestError(PLATFORM_DENIED_MESSAGE[platform]);
    }

    const isAdmin = isAdminScope(scopes);
    const session = await prisma.session.create({
      data: {
        employeeId: employee.id,
        platform,
        deviceInfo: deviceInfo || summarizeUserAgent(userAgent) || undefined,
        ipAddress,
      },
    });

    const token = jwt.sign(
      { employeeId: employee.id, isAdmin, sessionId: session.id } satisfies AuthTokenPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { passwordHash: _passwordHash, ...safeEmployee } = employee;
    return { token, employee: safeEmployee };
  },

  async logout(sessionId: string) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  },

  getById(id: string) {
    return prisma.employee.findUnique({ where: { id }, include });
  },

  async changePassword(employeeId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      omit: { passwordHash: false },
    });
    if (!employee?.passwordHash) {
      throw new BadRequestError('Không tìm thấy tài khoản');
    }

    const valid = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!valid) {
      throw new BadRequestError('Mật khẩu hiện tại không đúng');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.employee.update({ where: { id: employeeId }, data: { passwordHash } });
  },

  listSessions(employeeId: string) {
    return prisma.session.findMany({
      where: { employeeId },
      orderBy: { lastSeenAt: 'desc' },
    });
  },

  async revokeSession(employeeId: string, sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.employeeId !== employeeId) {
      throw new BadRequestError('Không tìm thấy phiên đăng nhập');
    }
    await prisma.session.delete({ where: { id: sessionId } });
  },
};
