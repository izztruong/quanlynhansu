import type { RecordStatus } from '@/types';

export function activeOnly<T extends { status: RecordStatus }>(items: T[]) {
  return items.filter((item) => item.status === 'ACTIVE');
}
