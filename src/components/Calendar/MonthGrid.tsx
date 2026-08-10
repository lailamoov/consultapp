import { formatMonthYear } from '../../utils/date';

export interface DaySessionDot {
  sessionId: string;
  color: string;
}

export function MonthGrid({
  monthDate,
  sessionsByDay,
  selectedDay,
  onSelectDay,
}: {
  monthDate: Date;
  sessionsByDay: Map<string, DaySessionDot[]>;
  selectedDay: string | null;
  onSelectDay: (iso: string) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isoFor = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${m}-${dd}`;
  };

  return (
    <div className="rounded-xl border border-fog bg-white p-3">
      <div className="mb-2 text-center font-display text-sm font-semibold text-ink">{formatMonthYear(monthDate)}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const iso = isoFor(day);
          const dots = sessionsByDay.get(iso) ?? [];
          const isSelected = selectedDay === iso;
          return (
            <button
              key={i}
              type="button"
              disabled={dots.length === 0}
              onClick={() => onSelectDay(iso)}
              className={`flex h-8 flex-col items-center justify-start rounded-md pt-0.5 text-[11px] transition ${
                dots.length === 0 ? 'text-ink/40' : 'font-medium text-ink hover:bg-mist'
              } ${isSelected ? 'bg-paleBlue ring-1 ring-navy' : ''}`}
            >
              <span>{day}</span>
              {dots.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {dots.slice(0, 3).map((dot, idx) => (
                    <span key={idx} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot.color }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
