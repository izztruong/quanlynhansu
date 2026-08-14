'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api-client';
import type { Employee } from '@/types';

const ADMIN_SCOPES = ['CMS', 'HRM Chủ'];

/** /auth/me trả kèm quyền để web ẩn bớt menu; chặn thật vẫn ở phía server. */
type CurrentUser = Employee & {
  isSystem?: boolean;
  /** Mã quyền dạng RESOURCE.ACTION, vd "EMPLOYEES.ADD". */
  permissions?: string[];
};

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  isAdmin: boolean;
  can: (resource: string, action?: PermissionAction) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Giữ tên hành động kiểu client (view/create/...) rồi quy đổi sang mã của
// server, để 17 chỗ gọi can() không phải đổi theo.
const ACTION_CODE: Record<PermissionAction, string> = {
  view: 'VIEW',
  create: 'ADD',
  update: 'EDIT',
  delete: 'DELETE',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.get<CurrentUser>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await api.post<Employee>('/auth/login', { email, password, platform: 'web' });
      // Endpoint đăng nhập không trả quyền, nên đọc lại /auth/me để có đủ.
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  const isAdmin = !!user && user.position.accessScopes.some((s) => ADMIN_SCOPES.includes(s));

  const can = useCallback(
    (resource: string, action: PermissionAction = 'view') => {
      if (!user) return false;
      if (user.isSystem) return true;
      return Boolean(user.permissions?.includes(`${resource}.${ACTION_CODE[action]}`));
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, isAdmin, can, login, logout, refresh }),
    [user, loading, isAdmin, can, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}
