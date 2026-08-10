import { useMemo, useState } from 'react';
import { useConsultationStore, servicesById } from '../../state/consultationStore';
import { buildLineItems, getGrandTotal } from '../../engine/consultationSelectors';
import { estimateFinancing } from '../../engine/financing';
import { careCreditConfig } from '../../data/careCreditConfig';
import { formatMoney } from '../../utils/format';
import { CreditCard, Info } from 'lucide-react';

export function FinancingEstimator() {
  const selectedServices = useConsultationStore((s) => s.selectedServices);
  const financingTermMonths = useConsultationStore((s) => s.financingTermMonths);
  const setFinancingTerm = useConsultationStore((s) => s.setFinancingTerm);
  const [showDisclosure, setShowDisclosure] = useState(false);

  const lineItems = useMemo(() => buildLineItems(servicesById, selectedServices), [selectedServices]);
  const total = useMemo(() => getGrandTotal(lineItems), [lineItems]);
  const estimates = useMemo(() => estimateFinancing(total, careCreditConfig), [total]);

  if (total <= 0) return null;

  return (
    <div className="rounded-2xl border border-fog bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard size={18} className="text-navy" />
        <h3 className="font-display text-base font-semibold text-ink">CareCredit Financing Estimate</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {estimates.map(({ tier, monthlyPayment, eligible, ineligibleReason }) => (
          <button
            key={tier.months}
            type="button"
            disabled={!eligible}
            onClick={() => setFinancingTerm(tier.months)}
            className={`rounded-xl border px-3 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
              financingTermMonths === tier.months ? 'border-navy bg-paleBlue' : 'border-fog hover:border-slate'
            }`}
          >
            <div className="text-xs font-medium uppercase tracking-wide text-slate">{tier.months} months</div>
            <div className="mt-1 font-display text-lg font-semibold text-navy">
              {eligible ? `${formatMoney(monthlyPayment)}` : '—'}
            </div>
            <div className="text-[11px] text-slate">{eligible ? '/ month est.' : ineligibleReason}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs italic text-slate">{careCreditConfig.paymentOnlyDisclaimer}</p>
      <button type="button" className="mt-2 text-xs font-medium text-navy underline-offset-2 hover:underline" onClick={() => setShowDisclosure((v) => !v)}>
        {showDisclosure ? 'Hide full promotional terms' : 'View full promotional terms'}
      </button>
      {showDisclosure && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-mist p-3 text-[11px] leading-relaxed text-ink/70">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>{careCreditConfig.disclosure}</span>
        </div>
      )}
    </div>
  );
}
