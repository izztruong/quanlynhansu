import { useCallback, useEffect, useState } from 'react';
import { api } from './api-client';
import { useAuth } from './auth-context';
import type { Attendance } from '../types';

export function useTodayAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Attendance[]>('/attendance/me/today');
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openSession = records.find((a) => a.checkIn && !a.checkOut) ?? null;
  const lastCompleted = [...records].reverse().find((a) => a.checkOut) ?? null;

  return { records, openSession, lastCompleted, loading, refresh };
}
