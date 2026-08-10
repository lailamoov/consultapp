import { useMemo, useState } from 'react';
import { useConsultationStore, servicesById } from '../../state/consultationStore';
import { MonthGrid, type DaySessionDot } from './MonthGrid';
import { ConflictModal } from './ConflictModal';
import { StatusPill } from '../common/StatusPill';
import { calendarColorCycle } from '../../data/theme';
import { disclaimers } from '../../data/disclaimers';
import { computeServicePricing } from '../../engine/pricing';
import { formatDateLong, fromISODate } from '../../utils/date';
import { formatMoney } from '../../utils/format';
import { CalendarDays } from 'lucide-react';

function assignColors(serviceIds: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  serviceIds.forEach((id, i) => {
    map[id] = calendarColorCycle[i % calendarColorCycle.length];
  });
  return map;
}

export function CalendarView() {
  const planStartDate = useConsultationStore((s) => s.planStartDate);
  const setPlanStartDate = useConsultationStore((s) => s.setPlanStartDate);
  const schedule = useConsultationStore((s) => s.schedule);
  const selectedServices = useConsultationStore((s) => s.selectedServices);
  const moveSessionDate = useConsultationStore((s) => s.moveSessionDate);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState('');

  const serviceIds = Object.keys(selectedServices);
  const colorFor = useMemo(() => assignColors(serviceIds), [serviceIds]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, DaySessionDot[]>();
    for (const session of schedule) {
      const list = map.get(session.date) ?? [];
      list.push({ sessionId: session.id, color: colorFor[session.serviceId] ?? '#102C49' });
      map.set(session.date, list);
    }
    return map;
  }, [schedule, colorFor]);

  const months = useMemo(() => {
    const start = fromISODate(planStartDate);
    const first = new Date(start.getFullYear(), start.getMonth(), 1);
    return Array.from({ length: 12 }, (_, i) => new Date(first.getFullYear(), first.getMonth() + i, 1));
  }, [planStartDate]);

  const daySessions = selectedDay ? schedule.filter((s) => s.date === selectedDay) : [];

  if (serviceIds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-fog p-10 text-center text-slate">
        Select services to generate a 12-month treatment timeline.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-fog bg-white p-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-navy" />
          <label className="text-sm font-medium text-ink/70">Plan start date</label>
          <input
            type="date"
            value={planStartDate}
            onChange={(e) => setPlanStartDate(e.target.value)}
            className="rounded-lg border border-fog px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {serviceIds.map((id) => (
            <div key={id} className="flex items-center gap-1.5 text-xs text-ink/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorFor[id] }} />
              {servicesById[id]?.name}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((m) => (
          <MonthGrid key={m.toISOString()} monthDate={m} sessionsByDay={sessionsByDay} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        ))}
      </div>

      {selectedDay && daySessions.length > 0 && (
        <div className="rounded-2xl border border-navy/20 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-base font-semibold text-ink">{formatDateLong(fromISODate(selectedDay))}</h4>
            <button className="text-xs text-slate hover:text-ink" onClick={() => setSelectedDay(null)}>
              Close
            </button>
          </div>
          <div className="space-y-3">
            {daySessions.map((session) => {
              const service = servicesById[session.serviceId];
              const selection = selectedServices[session.serviceId];
              const pricing = selection ? computeServicePricing(service, selection) : null;
              const perSession = pricing && selection.quantity > 0 ? pricing.subtotal / selection.quantity : 0;
              return (
                <div key={session.id} className="rounded-xl border border-fog p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorFor[session.serviceId] }} />
                        <span className="font-display text-sm font-medium text-ink">{service?.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate">
                        Session {session.sessionNumber} of {selection?.quantity} · {perSession ? formatMoney(perSession) : ''}
                        {session.manuallyAdjusted && ' · Manually adjusted'}
                      </div>
                    </div>
                    {session.status && session.status !== 'ok' && <StatusPill status={session.status} />}
                  </div>

                  {editingSessionId === session.id ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="date"
                        value={draftDate}
                        onChange={(e) => setDraftDate(e.target.value)}
                        className="rounded-lg border border-fog px-3 py-2 text-sm"
                      />
                      <button
                        className="rounded-lg bg-navy px-3 py-2 text-xs font-medium text-white"
                        onClick={() => {
                          moveSessionDate(session.id, draftDate);
                          setEditingSessionId(null);
                        }}
                      >
                        Save
                      </button>
                      <button className="rounded-lg border border-fog px-3 py-2 text-xs text-ink/70" onClick={() => setEditingSessionId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-3 text-xs font-medium text-navy underline-offset-2 hover:underline"
                      onClick={() => {
                        setEditingSessionId(session.id);
                        setDraftDate(session.date);
                      }}
                    >
                      Change date
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs italic text-slate">{disclaimers.timingEngine}</p>
      <ConflictModal />
    </div>
  );
}
