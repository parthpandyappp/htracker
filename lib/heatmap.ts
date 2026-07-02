export type DayCell = {
  year: number;
  month: number; // 0-11
  day: number;
  key: string; // "YYYY-MM-DD", local calendar date
  date: Date; // local midnight Date, for display formatting
};

export type MonthLabel = {
  weekIndex: number;
  label: string;
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// Computed fresh (not memoized) so callers can detect the day rolling over
// while a tab stays open, instead of trusting a stale grid snapshot.
export function getTodayKey(): string {
  const now = new Date();
  return dayKey(now.getFullYear(), now.getMonth(), now.getDate());
}

// Represents a local calendar day as a UTC-midnight instant, so day boundaries
// are unambiguous regardless of the server's timezone.
export function toUtcInstant(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString();
}

// Inverse of toUtcInstant: recovers the "YYYY-MM-DD" key from a stored log's date.
export function keyFromUtcIso(iso: string): string {
  const d = new Date(iso);
  return dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function buildHeatmapWeeks(weeksCount: number): {
  weeks: DayCell[][];
  monthLabels: MonthLabel[];
  todayKey: string;
  rangeStart: Date;
  rangeEnd: Date;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  const totalDays = weeksCount * 7;
  const start = new Date(today);
  start.setDate(start.getDate() - (totalDays - 1));
  start.setDate(start.getDate() - start.getDay()); // roll back to Sunday

  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay())); // forward to Saturday

  const days: DayCell[] = [];
  const cursor = new Date(start);
  while (cursor <= gridEnd) {
    days.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      day: cursor.getDate(),
      key: dayKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
      date: new Date(cursor),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;
  weeks.forEach((week, idx) => {
    const month = week[0].month;
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex: idx, label: MONTH_NAMES[month] });
      lastMonth = month;
    }
  });

  return { weeks, monthLabels, todayKey, rangeStart: start, rangeEnd: gridEnd };
}
