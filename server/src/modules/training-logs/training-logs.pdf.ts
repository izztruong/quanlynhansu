import path from 'path';
import PDFDocument from 'pdfkit';

// Roboto thay cho font mặc định của PDFKit (Helvetica) vì Helvetica không
// có dấu tiếng Việt. Trỏ lên 3 cấp từ thư mục hiện tại nên đúng cho cả
// khi chạy src/ (tsx) lẫn dist/ (đã build) mà không phụ thuộc cwd.
const FONT_DIR = path.resolve(__dirname, '../../../assets/fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'Roboto-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'Roboto-Bold.ttf');

const GRADE_BANDS = [
  { min: 90, label: 'Xuất sắc' },
  { min: 80, label: 'Tốt' },
  { min: 70, label: 'Khá' },
  { min: 50, label: 'Trung bình' },
  { min: 0, label: 'Cần cải thiện' },
];

export function gradeLabel(totalScore: number, maxTotal: number) {
  if (maxTotal <= 0) return '-';
  const percent = (totalScore / maxTotal) * 100;
  return GRADE_BANDS.find((b) => percent >= b.min)?.label ?? '-';
}

interface TrainingLogPdfData {
  employee: { name: string; dateOfBirth: Date | null; phone: string | null; email: string | null };
  branch: { name: string };
  department: { name: string };
  mentor: { name: string } | null;
  startDate: Date | null;
  endDate: Date | null;
  overallOpinion: string | null;
  sessions: {
    sessionNumber: number;
    sessionDate: Date | null;
    learnedContent: string | null;
    assignedTasks: string | null;
    evalAppearance: string | null;
    evalCommunication: string | null;
    evalPractice: string | null;
  }[];
  scores: {
    groupName: string;
    criteriaName: string;
    maxScore: number;
    score: number;
    note: string | null;
  }[];
}

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString('vi-VN') : '';
}

// Gom 3 nhãn cố định của cột "Đánh giá" thành một khối chữ, bỏ nhãn nào trống.
function buildEvaluationText(s: TrainingLogPdfData['sessions'][number]) {
  return [
    s.evalAppearance && `Tác phong: ${s.evalAppearance}`,
    s.evalCommunication && `Giao tiếp: ${s.evalCommunication}`,
    s.evalPractice && `Thực hành: ${s.evalPractice}`,
  ]
    .filter(Boolean)
    .join('\n');
}

type Doc = InstanceType<typeof PDFDocument>;

const PADDING = 5;
const FONT_SIZE = 9;

function drawTable(
  doc: Doc,
  startX: number,
  headers: string[],
  widths: number[],
  rows: string[][]
) {
  const bottomLimit = doc.page.height - doc.page.margins.bottom;

  const rowHeight = (cells: string[], bold: boolean) => {
    doc.font(bold ? 'vn-bold' : 'vn').fontSize(FONT_SIZE);
    const tallest = Math.max(
      ...cells.map((text, i) =>
        doc.heightOfString(text || ' ', { width: widths[i] - PADDING * 2 })
      )
    );
    return tallest + PADDING * 2;
  };

  const drawRow = (cells: string[], y: number, bold: boolean) => {
    const height = rowHeight(cells, bold);
    doc.font(bold ? 'vn-bold' : 'vn').fontSize(FONT_SIZE);
    let x = startX;
    cells.forEach((text, i) => {
      doc.rect(x, y, widths[i], height).stroke();
      doc.text(text || '', x + PADDING, y + PADDING, { width: widths[i] - PADDING * 2 });
      x += widths[i];
    });
    return y + height;
  };

  let y = doc.y;
  y = drawRow(headers, y, true);

  for (const row of rows) {
    // Sang trang khi hàng kế tiếp không còn đủ chỗ, rồi lặp lại hàng tiêu đề.
    if (y + rowHeight(row, false) > bottomLimit) {
      doc.addPage();
      y = doc.page.margins.top;
      y = drawRow(headers, y, true);
    }
    y = drawRow(row, y, false);
  }

  doc.y = y;
}

export function buildTrainingLogPdf(log: TrainingLogPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('vn', FONT_REGULAR);
    doc.registerFont('vn-bold', FONT_BOLD);

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    doc.font('vn-bold').fontSize(15).text('NHẬT KÝ HỌC VIỆC', { align: 'center' });
    doc.moveDown(1);

    const info: [string, string][] = [
      ['Tên nhân sự', log.employee.name],
      ['Ngày sinh', formatDate(log.employee.dateOfBirth)],
      ['SĐT', log.employee.phone ?? ''],
      ['Gmail', log.employee.email ?? ''],
      ['Cơ sở', log.branch.name],
      ['Bộ phận học việc', log.department.name],
      ['Người hướng dẫn', log.mentor?.name ?? ''],
      [
        'Thời gian diễn ra học việc',
        [formatDate(log.startDate), formatDate(log.endDate)].filter(Boolean).join(' - '),
      ],
    ];

    doc.fontSize(10);
    for (const [label, value] of info) {
      doc.font('vn-bold').text(`${label}: `, { continued: true });
      doc.font('vn').text(value || '');
    }

    doc.moveDown(1);

    if (log.sessions.length > 0) {
      drawTable(
        doc,
        left,
        ['Buổi', 'Nội dung được học', 'Các việc được giao để học tập', 'Đánh giá'],
        [46, 150, 150, contentWidth - 346],
        log.sessions.map((s) => [
          `Buổi ${s.sessionNumber}${s.sessionDate ? `\n${formatDate(s.sessionDate)}` : ''}`,
          s.learnedContent ?? '',
          s.assignedTasks ?? '',
          buildEvaluationText(s),
        ])
      );
      doc.moveDown(1.5);
    }

    if (log.scores.length > 0) {
      // Giữ nguyên thứ tự nhóm như lúc chấm thay vì sắp lại theo bảng chữ cái.
      const groups: { name: string; rows: TrainingLogPdfData['scores'] }[] = [];
      for (const s of log.scores) {
        const found = groups.find((g) => g.name === s.groupName);
        if (found) found.rows.push(s);
        else groups.push({ name: s.groupName, rows: [s] });
      }

      doc.font('vn-bold').fontSize(13).text('Kết quả');
      doc.moveDown(0.5);

      for (const group of groups) {
        const groupMax = group.rows.reduce((sum, r) => sum + r.maxScore, 0);
        doc.font('vn-bold').fontSize(10).text(`${group.name} (${groupMax} điểm)`);
        doc.moveDown(0.3);
        drawTable(
          doc,
          left,
          ['Tiêu chí', 'Điểm tối đa', 'Điểm đánh giá', 'Ghi chú'],
          [contentWidth - 290, 80, 90, 120],
          group.rows.map((r) => [r.criteriaName, String(r.maxScore), String(r.score), r.note ?? ''])
        );
        doc.moveDown(1);
      }

      const total = log.scores.reduce((sum, s) => sum + s.score, 0);
      const maxTotal = log.scores.reduce((sum, s) => sum + s.maxScore, 0);

      doc.font('vn-bold').fontSize(11).text(`Tổng điểm: `, { continued: true });
      doc.font('vn').text(`${total}/${maxTotal}`);
      doc.font('vn-bold').text('Đánh giá chung: ', { continued: true });
      doc.font('vn').text(gradeLabel(total, maxTotal));
      doc.moveDown(1);
    }

    if (log.overallOpinion) {
      doc.font('vn-bold').fontSize(11).text('Ý kiến');
      doc.font('vn').fontSize(10).text(log.overallOpinion);
      doc.moveDown(1.5);
    }

    if (log.mentor) {
      doc.font('vn-bold').fontSize(10).text('Người hướng dẫn', { align: 'right' });
      doc.moveDown(2);
      doc.font('vn').text(log.mentor.name, { align: 'right' });
    }

    doc.end();
  });
}
