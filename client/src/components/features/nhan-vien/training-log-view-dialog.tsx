'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import { gradeLabel, maxTotalScore, totalScore } from '@/lib/training-utils';
import type { TrainingLog } from '@/types';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-';
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="min-w-0 break-words font-medium">{value}</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logId: string | null;
}

export function TrainingLogViewDialog({ open, onOpenChange, logId }: Props) {
  const [log, setLog] = useState<TrainingLog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && logId) {
      setLoading(true);
      api
        .get<TrainingLog>(`/training-logs/${logId}`)
        .then(setLog)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLog(null);
    }
  }, [open, logId]);

  const groups: { name: string; items: TrainingLog['scores'] }[] = [];
  for (const score of log?.scores ?? []) {
    const found = groups.find((g) => g.name === score.groupName);
    if (found) found.items.push(score);
    else groups.push({ name: score.groupName, items: [score] });
  }

  const total = totalScore(log?.scores ?? []);
  const maxTotal = maxTotalScore(log?.scores ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu học việc</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}

          {!loading && log && (
            <div className="grid gap-5">
              <div className="grid gap-1.5">
                <Row label="Tên nhân sự" value={log.employee.name} />
                <Row label="Ngày sinh" value={formatDate(log.employee.dateOfBirth)} />
                <Row label="SĐT" value={log.employee.phone ?? '-'} />
                <Row label="Gmail" value={log.employee.email ?? '-'} />
                <Row label="Cơ sở" value={log.branch.name} />
                <Row label="Bộ phận học việc" value={log.department.name} />
                <Row label="Người hướng dẫn" value={log.mentor?.name ?? '-'} />
                <Row
                  label="Thời gian diễn ra học việc"
                  value={
                    log.startDate || log.endDate
                      ? `${formatDate(log.startDate)} - ${formatDate(log.endDate)}`
                      : '-'
                  }
                />
              </div>

              {log.sessions.length > 0 && (
                <div className="grid gap-3">
                  <p className="text-base font-semibold">Các buổi học việc</p>
                  {log.sessions.map((s) => (
                    <div key={s.id} className="grid gap-1.5 rounded-lg border p-3 text-sm">
                      <p className="font-medium">
                        Buổi {s.sessionNumber}
                        {s.sessionDate && (
                          <span className="ml-2 font-normal text-muted-foreground">
                            {formatDate(s.sessionDate)}
                          </span>
                        )}
                      </p>
                      {s.learnedContent && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-muted-foreground">Nội dung được học: </span>
                          {s.learnedContent}
                        </p>
                      )}
                      {s.assignedTasks && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-muted-foreground">Việc được giao: </span>
                          {s.assignedTasks}
                        </p>
                      )}
                      {s.evalAppearance && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-muted-foreground">Tác phong: </span>
                          {s.evalAppearance}
                        </p>
                      )}
                      {s.evalCommunication && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-muted-foreground">Giao tiếp: </span>
                          {s.evalCommunication}
                        </p>
                      )}
                      {s.evalPractice && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-muted-foreground">Thực hành: </span>
                          {s.evalPractice}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {groups.length > 0 && (
                <div className="grid gap-3">
                  <p className="text-base font-semibold">Kết quả</p>
                  {groups.map((group) => (
                    <div key={group.name} className="grid gap-1">
                      <p className="text-sm font-medium">
                        {group.name} ({group.items.reduce((s, i) => s + i.maxScore, 0)} điểm)
                      </p>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex gap-2 pl-1 text-sm">
                          <span className="min-w-0 flex-1 break-words text-muted-foreground">
                            {item.criteriaName}
                          </span>
                          <span className="shrink-0 font-medium">
                            {item.score}/{item.maxScore}
                          </span>
                          {item.note && (
                            <span className="shrink-0 text-muted-foreground">({item.note})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="border-t pt-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Tổng điểm: </span>
                      <span className="font-medium">
                        {total}/{maxTotal}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Đánh giá chung: </span>
                      <span className="font-medium">{gradeLabel(total, maxTotal)}</span>
                    </p>
                  </div>
                </div>
              )}

              {log.overallOpinion && (
                <div className="grid gap-1">
                  <p className="text-base font-semibold">Ý kiến</p>
                  <p className="whitespace-pre-wrap break-words text-sm">{log.overallOpinion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
