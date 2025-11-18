export function getDayLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP");
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("ja-JP");
}

export function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

export function generateAllDays(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(getDayLabel(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function generateAllWeeks(startDate: Date, endDate: Date): string[] {
  const weeks: string[] = [];
  let current = new Date(getWeekStart(startDate));
  while (current <= endDate) {
    weeks.push(getWeekStart(new Date(current)));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export function generateAllMonths(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (current <= endDate) {
    months.push(getMonthLabel(new Date(current)));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}
