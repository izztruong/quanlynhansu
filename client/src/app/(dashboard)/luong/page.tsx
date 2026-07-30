'use client';

import { usePageTitle } from '@/components/layout/page-title-context';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function LuongPage() {
  usePageTitle('Lương');
  return <ComingSoon description="Chức năng tính lương sẽ được bổ sung ở giai đoạn tiếp theo." />;
}
