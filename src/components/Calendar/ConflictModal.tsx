import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useConsultationStore, servicesById } from '../../state/consultationStore';
import { disclaimers } from '../../data/disclaimers';
import { formatDateLong, fromISODate } from '../../utils/date';

export function ConflictModal({ onChooseAnotherDate }: { onChooseAnotherDate?: (sessionId: string) => void }) {
  const activeConflicts = useConsultationStore((s) => s.activeConflicts);
  const schedule = useConsultationStore((s) => s.schedule);
  const moveSessionDate = useConsultationStore((s) => s.moveSessionDate);
  const addOverride = useConsultationStore((s) => s.addOverride);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  if (activeConflicts.length === 0) return null;

  const first = activeConflicts[0];
  const session = schedule.find((s) => s.id === first.sessionId);
  if (!session) return null;
  const service = servicesById[session.serviceId];

  const hardConflicts = activeConflicts.filter((c) => c.status === 'conflict');
  const reviewNeeded = activeConflicts.filter((c) => c.status === 'provider-review-required');

  const earliestEligible = hardConflicts.reduce<string | undefined>((latest, c) => {
    if (!c.earliestEligibleDate) return latest;
    if (!latest || c.earliestEligibleDate > latest) return c.earliestEligibleDate;
    return latest;
  }, undefined);

  function close() {
    useConsultationStore.setState({ activeConflicts: [] });
  }

  function handleChooseAnother() {
    const sessionId = session!.id;
    close();
    onChooseAnotherDate?.(sessionId);
  }

  function handleMoveToEligible() {
    if (earliestEligible) {
      moveSessionDate(session!.id, earliestEligible);
    }
  }

  function handleOverride() {
    for (const c of activeConflicts) {
      const other = schedule.find((s) => s.id === c.otherSessionId);
      if (other) {
        addOverride(session!.serviceId, other.serviceId, overrideReason, 'Provider');
      }
    }
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-panel sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${hardConflicts.length ? 'bg-[#FDE9E7]' : 'bg-[#FFF6E5]'}`}>
              <AlertTriangle size={18} className={hardConflicts.length ? 'text-[#D14A3C]' : 'text-[#E0A100]'} />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{hardConflicts.length ? 'Timing Conflict' : 'Provider Review Required'}</h3>
              <p className="text-sm text-slate">
                {service?.name} — Session {session.sessionNumber} on {formatDateLong(fromISODate(session.date))}
              </p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="text-slate hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {activeConflicts.map((c, i) => (
            <div key={i} className="rounded-xl border border-fog bg-mist/60 p-3 text-sm text-ink/80">
              {c.message}
            </div>
          ))}
        </div>

        {reviewNeeded.length > 0 && hardConflicts.length === 0 && (
          <p className="mt-3 text-xs text-slate">
            No established MOOV timing guidance covers this pairing. This is not necessarily unsafe — it means clinical judgment and provider sign-off are required before confirming these dates.
          </p>
        )}

        <p className="mt-4 text-xs italic text-slate">{disclaimers.timingEngine}</p>

        {!showOverrideForm ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {earliestEligible && (
              <button type="button" onClick={handleMoveToEligible} className="rounded-full bg-navy px-4 py-2.5 text-sm font-medium text-white">
                Move to next eligible date ({formatDateLong(fromISODate(earliestEligible))})
              </button>
            )}
            <button type="button" onClick={handleChooseAnother} className="rounded-full border border-fog px-4 py-2.5 text-sm font-medium text-ink/70">
              Choose another date
            </button>
            <button type="button" onClick={() => setShowOverrideForm(true)} className="rounded-full border border-[#D14A3C]/40 px-4 py-2.5 text-sm font-medium text-[#D14A3C]">
              Provider override
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate">Reason for override (required, recorded in consultation record)</label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none"
              placeholder="e.g. Patient tolerance confirmed, provider approved same-day sequencing."
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!overrideReason.trim()}
                onClick={handleOverride}
                className="rounded-full bg-[#D14A3C] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                Confirm override
              </button>
              <button type="button" onClick={() => setShowOverrideForm(false)} className="rounded-full border border-fog px-4 py-2.5 text-sm font-medium text-ink/70">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
