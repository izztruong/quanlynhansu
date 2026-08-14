'use client';

import { formatWeekRange } from '@/lib/work-review-utils';
import type { WorkReview } from '@/types';

export function WorkReviewView({ review }: { review: WorkReview }) {
  return (
    <div className="grid min-w-0 gap-4">
      <div className="grid gap-1 text-sm">
        <p>
          <span className="text-muted-foreground">Tuần đánh giá: </span>
          <span className="font-medium">{formatWeekRange(review.weekStartDate)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Bộ phận: </span>
          <span className="font-medium">{review.employee.department.name}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Người đánh giá: </span>
          <span className="font-medium">{review.reviewer?.name ?? '-'}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Chấm điểm: </span>
          <span className="font-medium">
            {review.score}/{review.maxScore}
          </span>
        </p>
      </div>

      {review.notes.length > 0 && (
        <div className="grid min-w-0 gap-2">
          <p className="text-sm font-semibold">Nhận xét chung</p>
          {review.notes.map((note) => (
            <div key={note.id} className="min-w-0 text-sm">
              <p className="font-medium">{note.sectionName}</p>
              <p className="whitespace-pre-wrap break-words text-muted-foreground">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
