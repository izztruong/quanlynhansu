import type { AuthTokenPayload } from '@/modules/auth/auth.service';
import type { Access } from '@/common/permissions';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      /** Quyền + phạm vi dữ liệu, giải một lần mỗi request (xem getAccess). */
      access?: Access;
    }
  }
}

export {};
