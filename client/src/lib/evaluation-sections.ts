import type { EvaluationSection } from '@/types';

export const EVALUATION_SECTIONS: { value: EvaluationSection; label: string }[] = [
  { value: 'WORK_ATTITUDE', label: '1. Tác phong và tinh thần' },
  { value: 'PROFESSIONAL_COMPETENCE', label: '2. Năng lực chuyên môn và tư duy' },
  { value: 'TEAM_ENGAGEMENT', label: '3. Khả năng gắn bó, hòa đồng' },
];

export function evaluationSectionLabel(section: EvaluationSection) {
  return EVALUATION_SECTIONS.find((s) => s.value === section)?.label ?? section;
}
