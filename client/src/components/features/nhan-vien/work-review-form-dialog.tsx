'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/simple-select';
import { api } from '@/lib/api-client';
import { activeOnly } from '@/lib/record-utils';
import { mondayOf } from '@/lib/work-review-utils';
import type { Employee, WorkReview, WorkReviewSection } from '@/types';

interface NoteState {
  sectionId?: string;
  sectionName: string;
  content: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cố định nhân viên (mở từ trang chi tiết); bỏ trống thì hiện ô chọn. */
  employeeId?: string;
  employees?: Employee[];
  /** Có giá trị = sửa phiếu, bỏ trống = tạo mới. */
  review?: WorkReview | null;
  onSaved: () => void;
}

export function WorkReviewFormDialog({
  open,
  onOpenChange,
  employeeId,
  employees,
  review,
  onSaved,
}: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [reviewerId, setReviewerId] = useState('none');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('10');
  const [notes, setNotes] = useState<NoteState[]>([]);
  const [reviewers, setReviewers] = useState<Employee[]>([]);

  const loadSections = useCallback(async () => {
    const sections = await api.get<WorkReviewSection[]>('/work-review-sections');
    return activeOnly(sections)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ sectionId: s.id, sectionName: s.name, content: '' }));
  }, []);

  useEffect(() => {
    if (!open) return;
    api
      .get<Employee[]>('/employees')
      .then(setReviewers)
      .catch(() => toast.error('Không tải được danh sách nhân viên — chức vụ của bạn cần quyền Xem ở mục Nhân viên'));

    if (review) {
      setSelectedEmployeeId(review.employeeId);
      setWeekStartDate(review.weekStartDate.slice(0, 10));
      setReviewerId(review.reviewer?.id ?? 'none');
      setScore(String(review.score));
      setMaxScore(String(review.maxScore));
      // Phiếu cũ giữ đúng các mục đã viết, không nạp lại từ danh mục.
      setNotes(
        review.notes.map((n) => ({
          sectionId: n.sectionId ?? undefined,
          sectionName: n.sectionName,
          content: n.content,
        }))
      );
    } else {
      setSelectedEmployeeId(employeeId ?? employees?.[0]?.id ?? '');
      setWeekStartDate(mondayOf(new Date()));
      setReviewerId('none');
      setScore('');
      setMaxScore('10');
      loadSections()
        .then(setNotes)
        .catch(() => setNotes([]));
    }
  }, [open, review, employeeId, employees, loadSections]);

  const updateNote = (index: number, content: string) => {
    setNotes((list) => list.map((n, i) => (i === index ? { ...n, content } : n)));
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }
    if (score === '') {
      toast.error('Vui lòng nhập điểm');
      return;
    }
    if (Number(score) > Number(maxScore)) {
      toast.error(`Điểm không được vượt quá ${maxScore}`);
      return;
    }

    const payload = {
      employeeId: selectedEmployeeId,
      weekStartDate,
      reviewerId: reviewerId === 'none' ? undefined : reviewerId,
      score: Number(score),
      maxScore: Number(maxScore),
      notes: notes.map((n, i) => ({
        sectionId: n.sectionId,
        sectionName: n.sectionName,
        content: n.content,
        order: i,
      })),
    };

    if (review) {
      await api.put(`/work-reviews/${review.id}`, payload);
      toast.success('Đã cập nhật phiếu đánh giá tuần');
    } else {
      await api.post('/work-reviews', payload);
      toast.success('Đã tạo phiếu đánh giá tuần');
    }
    onSaved();
  };

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={review ? 'Sửa phiếu đánh giá tuần' : 'Tạo phiếu đánh giá tuần'}
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-2xl"
    >
      {employees && !employeeId && (
        <div className="grid gap-2">
          <Label>Nhân viên</Label>
          <SimpleSelect
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.code})` }))}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="wr-week">Tuần đánh giá (thứ Hai)</Label>
          <Input
            id="wr-week"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(mondayOf(new Date(e.target.value)))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Người đánh giá</Label>
          <SimpleSelect
            value={reviewerId}
            onValueChange={setReviewerId}
            options={[
              { value: 'none', label: 'Chưa chỉ định' },
              ...reviewers.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` })),
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="wr-score">Chấm điểm</Label>
          <Input
            id="wr-score"
            type="number"
            step="any"
            min={0}
            max={Number(maxScore)}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wr-max">Thang điểm</Label>
          <Input
            id="wr-max"
            type="number"
            min={1}
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border p-4">
        <p className="text-base font-semibold">Nhận xét chung</p>

        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Chưa có mục nhận xét nào. Vào Danh mục → Cấu hình đánh giá tuần để khai báo trước.
          </p>
        )}

        {notes.map((note, index) => (
          <div key={index} className="grid gap-2">
            <Label htmlFor={`note-${index}`}>{note.sectionName}</Label>
            <Textarea
              id={`note-${index}`}
              value={note.content}
              onChange={(e) => updateNote(index, e.target.value)}
              placeholder="Mỗi ý một dòng..."
            />
          </div>
        ))}
      </div>
    </CrudFormDialog>
  );
}
