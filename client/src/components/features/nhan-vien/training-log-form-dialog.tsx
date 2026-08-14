'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/simple-select';
import { api } from '@/lib/api-client';
import { activeOnly } from '@/lib/record-utils';
import type {
  Branch,
  Department,
  Employee,
  TrainingCriteriaGroup,
  TrainingLog,
  TrainingLogStatus,
} from '@/types';

interface SessionState {
  sessionNumber: number;
  sessionDate: string;
  learnedContent: string;
  assignedTasks: string;
  evalAppearance: string;
  evalCommunication: string;
  evalPractice: string;
}

interface ScoreState {
  criteriaId?: string;
  groupName: string;
  criteriaName: string;
  maxScore: number;
  score: string;
  note: string;
}

function emptySession(sessionNumber: number): SessionState {
  return {
    sessionNumber,
    sessionDate: '',
    learnedContent: '',
    assignedTasks: '',
    evalAppearance: '',
    evalCommunication: '',
    evalPractice: '',
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  branches: Branch[];
  departments: Department[];
  /** Có giá trị = sửa phiếu, bỏ trống = tạo mới. */
  log?: TrainingLog | null;
  onSaved: () => void;
}

export function TrainingLogFormDialog({
  open,
  onOpenChange,
  employee,
  branches,
  departments,
  log,
  onSaved,
}: Props) {
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [mentorId, setMentorId] = useState('none');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TrainingLogStatus>('IN_PROGRESS');
  const [overallOpinion, setOverallOpinion] = useState('');
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [scores, setScores] = useState<ScoreState[]>([]);
  const [mentors, setMentors] = useState<Employee[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(false);

  useEffect(() => {
    if (!open) return;
    api
      .get<Employee[]>('/employees')
      .then(setMentors)
      .catch(() => toast.error('Không tải được danh sách nhân viên — chức vụ của bạn cần quyền Xem ở mục Nhân viên'));

    if (log) {
      setBranchId(log.branch.id);
      setDepartmentId(log.department.id);
      setMentorId(log.mentor?.id ?? 'none');
      setStartDate(log.startDate?.slice(0, 10) ?? '');
      setEndDate(log.endDate?.slice(0, 10) ?? '');
      setStatus(log.status);
      setOverallOpinion(log.overallOpinion ?? '');
      setSessions(
        log.sessions.map((s) => ({
          sessionNumber: s.sessionNumber,
          sessionDate: s.sessionDate?.slice(0, 10) ?? '',
          learnedContent: s.learnedContent ?? '',
          assignedTasks: s.assignedTasks ?? '',
          evalAppearance: s.evalAppearance ?? '',
          evalCommunication: s.evalCommunication ?? '',
          evalPractice: s.evalPractice ?? '',
        }))
      );
      // Phiếu cũ dùng đúng thang điểm đã chụp lúc chấm, không nạp lại từ danh mục.
      setScores(
        log.scores.map((s) => ({
          criteriaId: s.criteriaId ?? undefined,
          groupName: s.groupName,
          criteriaName: s.criteriaName,
          maxScore: s.maxScore,
          score: String(s.score),
          note: s.note ?? '',
        }))
      );
    } else {
      setBranchId(employee.branch.id);
      setDepartmentId(employee.department.id);
      setMentorId('none');
      setStartDate('');
      setEndDate('');
      setStatus('IN_PROGRESS');
      setOverallOpinion('');
      setSessions([emptySession(1)]);
      setScores([]);
    }
  }, [open, log, employee]);

  // Chỉ phiếu mới mới nạp tiêu chí theo bộ phận; phiếu đang sửa giữ nguyên
  // bảng điểm đã chụp để tổng điểm cũ không bị đổi.
  const loadCriteria = useCallback(async () => {
    if (!open || log || !departmentId) return;
    setLoadingCriteria(true);
    try {
      const groups = await api.get<TrainingCriteriaGroup[]>(
        `/training-criteria?departmentId=${departmentId}`
      );
      const next: ScoreState[] = [];
      for (const group of activeOnly(groups)) {
        for (const criteria of activeOnly(group.criteria)) {
          next.push({
            criteriaId: criteria.id,
            groupName: group.name,
            criteriaName: criteria.name,
            maxScore: criteria.maxScore,
            score: '',
            note: '',
          });
        }
      }
      setScores(next);
    } catch {
      setScores([]);
    } finally {
      setLoadingCriteria(false);
    }
  }, [open, log, departmentId]);

  useEffect(() => {
    loadCriteria();
  }, [loadCriteria]);

  const updateSession = (index: number, patch: Partial<SessionState>) => {
    setSessions((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSession = () => {
    setSessions((list) => [...list, emptySession(list.length + 1)]);
  };

  const removeSession = (index: number) => {
    setSessions((list) =>
      list.filter((_, i) => i !== index).map((s, i) => ({ ...s, sessionNumber: i + 1 }))
    );
  };

  const updateScore = (index: number, patch: Partial<ScoreState>) => {
    setScores((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const totalScore = scores.reduce((sum, s) => sum + (s.score === '' ? 0 : Number(s.score)), 0);
  const maxTotal = scores.reduce((sum, s) => sum + s.maxScore, 0);

  const handleSubmit = async () => {
    const overMax = scores.find((s) => s.score !== '' && Number(s.score) > s.maxScore);
    if (overMax) {
      toast.error(`"${overMax.criteriaName}" vượt quá điểm tối đa (${overMax.maxScore})`);
      return;
    }

    const payload = {
      employeeId: employee.id,
      branchId,
      departmentId,
      mentorId: mentorId === 'none' ? undefined : mentorId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      overallOpinion: overallOpinion || undefined,
      sessions: sessions.map((s) => ({
        sessionNumber: s.sessionNumber,
        sessionDate: s.sessionDate || undefined,
        learnedContent: s.learnedContent || undefined,
        assignedTasks: s.assignedTasks || undefined,
        evalAppearance: s.evalAppearance || undefined,
        evalCommunication: s.evalCommunication || undefined,
        evalPractice: s.evalPractice || undefined,
      })),
      scores: scores
        .filter((s) => s.score !== '')
        .map((s) => ({
          criteriaId: s.criteriaId,
          groupName: s.groupName,
          criteriaName: s.criteriaName,
          maxScore: s.maxScore,
          score: Number(s.score),
          note: s.note || undefined,
        })),
    };

    if (log) {
      await api.put(`/training-logs/${log.id}`, payload);
      toast.success('Đã cập nhật phiếu học việc');
    } else {
      await api.post('/training-logs', payload);
      toast.success('Đã tạo phiếu học việc');
    }
    onSaved();
  };

  // Gom theo nhóm nhưng giữ nguyên thứ tự xuất hiện, không sắp lại.
  const groupedScores: { name: string; items: { score: ScoreState; index: number }[] }[] = [];
  scores.forEach((score, index) => {
    const found = groupedScores.find((g) => g.name === score.groupName);
    if (found) found.items.push({ score, index });
    else groupedScores.push({ name: score.groupName, items: [{ score, index }] });
  });

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={log ? 'Sửa phiếu học việc' : 'Tạo phiếu học việc'}
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-3xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Cơ sở</Label>
          <SimpleSelect
            value={branchId}
            onValueChange={setBranchId}
            options={activeOnly(branches).map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Bộ phận học việc</Label>
          <SimpleSelect
            value={departmentId}
            onValueChange={setDepartmentId}
            options={activeOnly(departments).map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Người hướng dẫn</Label>
          <SimpleSelect
            value={mentorId}
            onValueChange={setMentorId}
            options={[
              { value: 'none', label: 'Chưa chỉ định' },
              ...mentors.map((m) => ({ value: m.id, label: `${m.name} (${m.code})` })),
            ]}
          />
        </div>
        <div className="grid gap-2">
          <Label>Trạng thái</Label>
          <SimpleSelect
            value={status}
            onValueChange={(v) => setStatus(v as TrainingLogStatus)}
            options={[
              { value: 'IN_PROGRESS', label: 'Đang học việc' },
              { value: 'COMPLETED', label: 'Đã hoàn thành' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tl-start">Bắt đầu học việc</Label>
          <Input
            id="tl-start"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tl-end">Kết thúc học việc</Label>
          <Input
            id="tl-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold">Các buổi học việc</p>
          <Button type="button" variant="outline" size="sm" onClick={addSession}>
            <Plus className="size-4" />
            Thêm buổi
          </Button>
        </div>

        {sessions.map((session, index) => (
          <div key={index} className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Buổi {session.sessionNumber}</p>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={session.sessionDate}
                  onChange={(e) => updateSession(index, { sessionDate: e.target.value })}
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-red-500 hover:text-red-600"
                  onClick={() => removeSession(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nội dung được học</Label>
              <Textarea
                value={session.learnedContent}
                onChange={(e) => updateSession(index, { learnedContent: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Các việc được giao để học tập</Label>
              <Textarea
                value={session.assignedTasks}
                onChange={(e) => updateSession(index, { assignedTasks: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Đánh giá — Tác phong</Label>
              <Textarea
                value={session.evalAppearance}
                onChange={(e) => updateSession(index, { evalAppearance: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Đánh giá — Giao tiếp</Label>
              <Textarea
                value={session.evalCommunication}
                onChange={(e) => updateSession(index, { evalCommunication: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Đánh giá — Thực hành</Label>
              <Textarea
                value={session.evalPractice}
                onChange={(e) => updateSession(index, { evalPractice: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold">Kết quả</p>
          {scores.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Tổng: <span className="font-medium">{totalScore}</span>/{maxTotal}
            </span>
          )}
        </div>

        {loadingCriteria && <p className="text-sm text-muted-foreground">Đang tải tiêu chí...</p>}

        {!loadingCriteria && scores.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Vị trí này chưa có bộ tiêu chí học việc. Vào Danh mục → Cấu hình học việc để tạo trước.
          </p>
        )}

        {groupedScores.map((group) => (
          <div key={group.name} className="grid gap-2">
            <p className="text-sm font-medium">
              {group.name} ({group.items.reduce((s, i) => s + i.score.maxScore, 0)} điểm)
            </p>
            {group.items.map(({ score, index }) => (
              <div key={index} className="grid grid-cols-[1fr_90px_1fr] items-center gap-2">
                <span className="truncate text-sm">{score.criteriaName}</span>
                <Input
                  type="number"
                  min={0}
                  max={score.maxScore}
                  placeholder={`/${score.maxScore}`}
                  value={score.score}
                  onChange={(e) => updateScore(index, { score: e.target.value })}
                />
                <Input
                  placeholder="Ghi chú"
                  value={score.note}
                  onChange={(e) => updateScore(index, { note: e.target.value })}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tl-opinion">Ý kiến</Label>
        <Textarea
          id="tl-opinion"
          value={overallOpinion}
          onChange={(e) => setOverallOpinion(e.target.value)}
          placeholder="Mỗi ý kiến một dòng..."
        />
      </div>
    </CrudFormDialog>
  );
}
