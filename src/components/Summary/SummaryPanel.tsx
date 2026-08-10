import { useMemo } from 'react';
import { useConsultationStore, servicesById } from '../../state/consultationStore';
import { buildLineItems, getGrandTotal, getTodaysVisitCost, hasUnresolvedPricing } from '../../engine/consultationSelectors';
import { formatMoney } from '../../utils/format';
import { AlertTriangle } from 'lucide-react';

export function SummaryPanel() {
  const selectedServices = useConsultationStore((s) => s.selectedServices);
  const schedule = useConsultationStore((s) => s.schedule);
  const planStartDate = useConsultationStore((s) => s.planStartDate);
  const toggleService = useConsultationStore((s) => s.toggleService);

  const lineItems = useMemo(() => buildLineItems(servicesById, selectedServices), [selectedServices]);
  const grandTotal = useMemo(() => getGrandTotal(lineItems), [lineItems]);
  const todaysCost = useMemo(() => getTodaysVisitCost(lineItems, schedule, planStartDate), [lineItems, schedule, planStartDate]);
  const unresolved = hasUnresolvedPricing(lineItems);

  if (lineItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-fog bg-white/60 p-6 text-center text-sm text-slate">
        Select services to start building this patient's treatment plan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
        {lineItems.map(({ service, selection, pricing }) => (
          <div key={service.id} className="flex items-start justify-between gap-3 rounded-xl border border-fog bg-white px-3.5 py-3">
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-medium text-ink">{service.name}</div>
              <div className="text-xs text-slate">
                {selection.quantity} session{selection.quantity === 1 ? '' : 's'}
                {pricing.matchedPackageLabel ? ` · ${pricing.matchedPackageLabel}` : ''}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                <div className="font-display text-sm font-semibold text-navy">
                  {pricing.needsConfirmation ? 'TBD' : formatMoney(pricing.subtotal)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleService(service.id)}
                className="text-xs text-slate hover:text-[#D14A3C]"
                aria-label={`Remove ${service.name}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {unresolved && (
        <div className="flex items-start gap-2 rounded-xl border border-[#E0A100]/30 bg-[#FFF6E5] px-3.5 py-2.5 text-xs text-[#8A5A00]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          One or more services need a confirmed price before totals are final.
        </div>
      )}

      <div className="space-y-1.5 border-t border-fog pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink/70">Total Treatment Plan Value</span>
          <span className="font-display text-xl font-semibold text-ink">{formatMoney(grandTotal)}</span>
        </div>
        {Math.round(todaysCost) !== Math.round(grandTotal) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">Estimated Initial Visit / Today's Cost</span>
            <span className="font-display text-lg font-medium text-navy">{formatMoney(todaysCost)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
