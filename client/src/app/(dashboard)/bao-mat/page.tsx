'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Monitor, Smartphone, LogOut } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Session } from '@/types';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới nhập lại không khớp');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Đã đổi mật khẩu');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="mb-4 font-semibold">Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit} className="grid max-w-sm gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </Button>
      </form>
    </div>
  );
}

function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return api
      .get<Session[]>('/auth/sessions')
      .then(setSessions)
      .catch(() => toast.error('Không tải được danh sách thiết bị'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (session: Session) => {
    setRevokingId(session.id);
    try {
      await api.delete(`/auth/sessions/${session.id}`);
      toast.success('Đã đăng xuất thiết bị');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="mb-4 font-semibold">Thiết bị đã đăng nhập</h3>

      {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
      {!loading && sessions.length === 0 && (
        <p className="text-sm text-muted-foreground">Không có thiết bị nào</p>
      )}

      <div className="grid gap-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {session.platform === 'web' ? (
                <Monitor className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {session.deviceInfo ?? (session.platform === 'web' ? 'Trình duyệt web' : 'Ứng dụng di động')}
                {session.isCurrent && (
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Thiết bị này
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.ipAddress ? `${session.ipAddress} — ` : ''}
                Hoạt động gần nhất: {formatDateTime(session.lastSeenAt)}
              </p>
            </div>
            {!session.isCurrent && (
              <Button
                variant="outline"
                size="sm"
                disabled={revokingId === session.id}
                onClick={() => handleRevoke(session)}
              >
                <LogOut className="size-3.5" />
                Đăng xuất
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BaoMatPage() {
  usePageTitle('Bảo mật tài khoản');

  return (
    <div className="grid max-w-2xl gap-4">
      <PasswordSection />
      <SessionsSection />
    </div>
  );
}
