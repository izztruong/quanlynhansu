import type { TrainingScore } from '@/types';

// Xếp loại tính theo phần trăm chứ không theo điểm thô, vì mỗi vị trí có
// thang điểm riêng và thang có thể đổi theo thời gian.
const GRADE_BANDS = [
  { min: 90, label: 'Xuất sắc' },
  { min: 80, label: 'Tốt' },
  { min: 70, label: 'Khá' },
  { min: 50, label: 'Trung bình' },
  { min: 0, label: 'Cần cải thiện' },
];

export function totalScore(scores: TrainingScore[]) {
  return scores.reduce((sum, s) => sum + s.score, 0);
}

export function maxTotalScore(scores: TrainingScore[]) {
  return scores.reduce((sum, s) => sum + s.maxScore, 0);
}

export function gradeLabel(total: number, maxTotal: number) {
  if (maxTotal <= 0) return '-';
  const percent = (total / maxTotal) * 100;
  return GRADE_BANDS.find((b) => percent >= b.min)?.label ?? '-';
}
