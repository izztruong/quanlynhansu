'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

interface WithId {
  id: string;
}

export function useCrud<T extends WithId>(basePath: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<T[]>(basePath);
      setItems(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: unknown) => {
      try {
        await api.post<T>(basePath, input);
        toast.success('Thêm mới thành công');
        await refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Thêm mới thất bại');
        throw err;
      }
    },
    [basePath, refresh]
  );

  const update = useCallback(
    async (id: string, input: unknown) => {
      try {
        await api.put<T>(`${basePath}/${id}`, input);
        toast.success('Cập nhật thành công');
        await refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
        throw err;
      }
    },
    [basePath, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await api.delete(`${basePath}/${id}`);
        toast.success('Xoá thành công');
        await refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Xoá thất bại');
        throw err;
      }
    },
    [basePath, refresh]
  );

  return { items, loading, refresh, create, update, remove };
}
