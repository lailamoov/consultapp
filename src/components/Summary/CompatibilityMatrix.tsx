import { useMemo } from 'react';
import { useConsultationStore, servicesById } from '../../state/consultationStore';
import { getRelationshipInfo } from '../../engine/timing';
import { isAestheticService } from '../../data/services';
import { StatusPill } from '../common/StatusPill';
import { disclaimers } from '../../data/disclaimers';
import { ShieldCheck } from 'lucide-react';

export function CompatibilityMatrix() {
  const selectedServices = useConsultationStore((s) => s.selectedServices);
  // Only aesthetic services are subject to the timing guide — wellness/lab
  // services can be scheduled alongside anything and never appear here.
  const serviceIds = Object.keys(selectedServices).filter((id) => {
    const service = servicesById[id];
    return service && isAestheticService(service);
  });

  const pairs = useMemo(() => {
    const result: ReturnType<typeof getRelationshipInfo>[] = [];
    for (let i = 0; i < serviceIds.length; i++) {
      for (let j = i + 1; j < serviceIds.length; j++) {
        const a = servicesById[serviceIds[i]];
        const b = servicesById[serviceIds[j]];
        if (a && b) result.push(getRelationshipInfo(a, b));
      }
    }
    return result;
  }, [serviceIds.join(',')]);

  if (pairs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-fog bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-navy" />
        <h2 className="font-display text-base font-semibold text-ink">Treatment Compatibility &amp; Timing</h2>
      </div>
      <div className="space-y-3">
        {pairs.map((rel) => {
          const a = servicesById[rel.serviceAId];
          const b = servicesById[rel.serviceBId];
          return (
            <div key={`${rel.serviceAId}-${rel.serviceBId}`} className="rounded-xl border border-fog p-4">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-sm font-medium text-ink">
                  {a?.name} + {b?.name}
                </span>
                <StatusPill status={rel.status} />
              </div>
              <p className="text-sm text-ink/70">{rel.summary}</p>
              {rel.notes && <p className="mt-1 text-xs text-slate">{rel.notes}</p>}
              {rel.internalNote && (
                <p className="mt-1.5 rounded-lg bg-mist px-2.5 py-1.5 text-[11px] text-slate">
                  <span className="font-medium">Internal note:</span> {rel.internalNote}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs italic text-slate">{disclaimers.timingEngine}</p>
    </section>
  );
}
