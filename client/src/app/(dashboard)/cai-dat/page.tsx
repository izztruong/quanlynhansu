'use client';

import { usePageTitle } from '@/components/layout/page-title-context';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function CaiDatPage() {
  usePageTitle('Cài đặt');
  return <ComingSoon description="Các tuỳ chọn cài đặt hệ thống sẽ được bổ sung ở giai đoạn tiếp theo." />;
}
