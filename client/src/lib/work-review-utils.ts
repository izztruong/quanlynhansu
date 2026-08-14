// Tuần được lưu bằng ngày thứ Hai thay vì số tuần ISO — số tuần rất dễ sai
// ở giao thừa (31/12 có thể thuộc tuần 1 của năm sau), còn ngày đầu tuần
// thì sắp xếp và so sánh đều thẳng thắn.
export function mondayOf(date: Date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  // getDay(): 0 = Chủ nhật, nên Chủ nhật phải lùi 6 ngày chứ không phải tiến.
  const offset = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + offset);
  return toLocalISODate(d);
}

export function toLocalISODate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function formatWeekRange(weekStartDate: string) {
  const start = new Date(weekStartDate);
  if (Number.isNaN(start.getTime())) return '-';
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
}
