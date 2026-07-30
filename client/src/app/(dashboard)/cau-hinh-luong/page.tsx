'use client';

import { usePageTitle } from '@/components/layout/page-title-context';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function CauHinhLuongPage() {
  usePageTitle('Cấu hình lương');
  return <ComingSoon description="Cấu hình công thức tính lương sẽ được bổ sung ở giai đoạn tiếp theo." />;
}
