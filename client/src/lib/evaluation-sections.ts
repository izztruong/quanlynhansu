import type { EvaluationSection } from '@/types';

export interface EvaluationSectionConfig {
  section: EvaluationSection;
  label: string;
  hasText: boolean;
  allowVideo: boolean;
}

export interface NumericFieldConfig {
  key: 'shiftsWorkedInMonth' | 'lateMinutesInMonth' | 'shiftChangeCount' | 'missedCheckInOutCount' | 'disciplinaryReportCount';
  label: string;
}

export interface EvaluationGroup {
  title: string;
  numericFields: NumericFieldConfig[];
  sections: EvaluationSectionConfig[];
}

export const EVALUATION_GROUPS: EvaluationGroup[] = [
  {
    title: '1. Tác phong và tinh thần',
    numericFields: [
      { key: 'shiftsWorkedInMonth', label: 'Số ca làm trong tháng' },
      { key: 'lateMinutesInMonth', label: 'Số phút đi muộn trong tháng' },
      { key: 'shiftChangeCount', label: 'Số lần đổi ca' },
      { key: 'missedCheckInOutCount', label: 'Số lần quên CI-CO và không chấm công' },
      { key: 'disciplinaryReportCount', label: 'Số lần bị phạt lập biên bản về lỗi ý thức' },
    ],
    sections: [],
  },
  {
    title: '2. Năng lực chuyên môn và tư duy',
    numericFields: [],
    sections: [
      { section: 'RECENT_TEST', label: 'Bài kiểm tra gần nhất', hasText: true, allowVideo: false },
      { section: 'MANAGER_REVIEW', label: 'Đánh giá của quản lý', hasText: true, allowVideo: false },
      { section: 'SUPERVISOR_REVIEW', label: 'Đánh giá của giám sát', hasText: true, allowVideo: false },
      { section: 'SURPRISE_INSPECTION', label: 'Giám sát đột xuất', hasText: true, allowVideo: true },
    ],
  },
  {
    title: '3. Khả năng gắn bó, hòa đồng',
    numericFields: [],
    sections: [
      { section: 'DIRECT_INTERVIEW', label: 'Phỏng vấn trực tiếp', hasText: true, allowVideo: false },
      {
        section: 'STORE_ENGAGEMENT',
        label: 'Tích cực tham gia các hoạt động quán (Review từ quản lý)',
        hasText: true,
        allowVideo: false,
      },
    ],
  },
];

export const EVALUATION_SECTIONS: EvaluationSectionConfig[] = EVALUATION_GROUPS.flatMap(
  (g) => g.sections
);
