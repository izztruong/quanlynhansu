import type { AuthTokenPayload } from '@/modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
