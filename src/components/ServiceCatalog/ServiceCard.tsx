import { useState } from 'react';
import { Check, ChevronDown, Info } from 'lucide-react';
import type { Service } from '../../types';
import { useConsultationStore } from '../../state/consultationStore';
import { computeServicePricing } from '../../engine/pricing';
import { formatMoney } from '../../utils/format';
import { QuantityStepper } from '../common/QuantityStepper';

function priceTeaser(service: Service): string {
  const p = service.pricing;
  switch (p.priceType) {
    case 'fixed':
      return `${formatMoney(p.individualPrice ?? 0)} / session`;
    case 'package': {
      if (p.individualPrice === undefined) {
        const firstPackage = p.packages?.[0];
        return firstPackage ? `${formatMoney(firstPackage.price)} (${firstPackage.label ?? `${firstPackage.quantity}-session package`})` : 'Package pricing only';
      }
      return `${formatMoney(p.individualPrice)} / session`;
    }
    case 'perUnit':
      return `${formatMoney(p.individualPrice ?? 0)} / ${p.unitLabel}`;
    case 'startingAt':
      return `${formatMoney(p.individualPrice ?? 0)}+`;
    case 'range':
      return `${formatMoney(p.rangeMin ?? 0)}–${formatMoney(p.rangeMax ?? 0)}`;
    case 'variable':
      return 'Pricing varies';
    case 'complementary':
      return 'Complementary';
    case 'unavailable':
      return 'Provider review required';
    default:
      return '';
  }
}

export function ServiceCard({ service }: { service: Service }) {
  const selection = useConsultationStore((s) => s.selectedServices[service.id]);
  const toggleService = useConsultationStore((s) => s.toggleService);
  const setQuantity = useConsultationStore((s) => s.setQuantity);
  const setPricingQuantity = useConsultationStore((s) => s.setPricingQuantity);
  const setCustomPrice = useConsultationStore((s) => s.setCustomPrice);
  const setPersonalizedRecommendation = useConsultationStore((s) => s.setPersonalizedRecommendation);
  const isSelected = !!selection;
  const [customPriceDraft, setCustomPriceDraft] = useState('');
  const [customReasonDraft, setCustomReasonDraft] = useState('');

  const pricing = isSelected ? computeServicePricing(service, selection) : null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition-all ${
        isSelected ? 'border-navy shadow-panel ring-1 ring-navy/10' : 'border-fog shadow-card hover:shadow-cardHover'
      }`}
    >
      <button
        type="button"
        onClick={() => toggleService(service.id)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
            isSelected ? 'border-navy bg-navy' : 'border-fog bg-white'
          }`}
        >
          {isSelected && <Check size={15} className="text-white" strokeWidth={3} />}
        </span>
        <span className="flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="font-display text-base font-medium text-ink">{service.name}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate">
            <span>{priceTeaser(service)}</span>
            <span className="text-fog">•</span>
            <span>{service.protocol.frequencyLabel}</span>
          </span>
        </span>
        <ChevronDown size={18} className={`mt-1 shrink-0 text-slate transition-transform ${isSelected ? 'rotate-180' : ''}`} />
      </button>

      {isSelected && selection && pricing && (
        <div className="space-y-5 border-t border-fog bg-mist/60 p-5">
          {/* Quantity + pricing */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate">Patient plan quantity</div>
              <div className="mt-1.5 flex items-center gap-3">
                <QuantityStepper value={selection.quantity} onChange={(v) => setQuantity(service.id, v)} suffix="sessions" min={1} />
                {selection.quantity !== service.protocol.standardQuantity && (
                  <span className="text-xs text-slate">Standard: {service.protocol.standardQuantity}</span>
                )}
              </div>
            </div>
            {service.hasSeparatePricingQuantity && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate">{service.pricingQuantityLabel ?? 'Units'}</div>
                <div className="mt-1.5">
                  <QuantityStepper
                    value={selection.pricingQuantity ?? 0}
                    onChange={(v) => setPricingQuantity(service.id, v)}
                    suffix={service.pricingQuantityLabel}
                    max={500}
                    min={service.pricing.minUnits ?? 0}
                    clearable
                  />
                  {service.pricing.minUnits && (
                    <div className="mt-1 text-xs text-slate">Minimum {service.pricing.minUnits} {service.pricingQuantityLabel}</div>
                  )}
                </div>
              </div>
            )}
            <div className="ml-auto text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-slate">Subtotal</div>
              <div className="font-display text-2xl font-semibold text-navy">{formatMoney(pricing.subtotal)}</div>
              <PricingMethodTag method={pricing.method} label={pricing.matchedPackageLabel} />
            </div>
          </div>

          <p className="text-sm text-ink/70">{pricing.explanation}</p>

          {pricing.needsConfirmation && (
            <div className="rounded-xl border border-[#E0A100]/30 bg-[#FFF6E5] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8A5A00]">
                <Info size={16} /> Provider review required — enter approved price
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="$ amount"
                  value={customPriceDraft}
                  onChange={(e) => setCustomPriceDraft(e.target.value)}
                  className="w-32 rounded-lg border border-fog px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={customReasonDraft}
                  onChange={(e) => setCustomReasonDraft(e.target.value)}
                  className="min-w-[160px] flex-1 rounded-lg border border-fog px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  disabled={!customPriceDraft}
                  onClick={() => setCustomPrice(service.id, Number(customPriceDraft), customReasonDraft || undefined)}
                >
                  Apply price
                </button>
              </div>
            </div>
          )}

          {!pricing.needsConfirmation && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-navy underline-offset-2 hover:underline">
                Enter a custom / approved price instead
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="$ amount"
                  value={customPriceDraft}
                  onChange={(e) => setCustomPriceDraft(e.target.value)}
                  className="w-32 rounded-lg border border-fog px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Reason (required for override)"
                  value={customReasonDraft}
                  onChange={(e) => setCustomReasonDraft(e.target.value)}
                  className="min-w-[160px] flex-1 rounded-lg border border-fog px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  disabled={!customPriceDraft}
                  onClick={() => setCustomPrice(service.id, Number(customPriceDraft), customReasonDraft || undefined)}
                >
                  Apply
                </button>
                {selection.customPrice !== undefined && (
                  <button
                    type="button"
                    className="rounded-lg border border-fog px-4 py-2 text-sm font-medium text-ink/70"
                    onClick={() => {
                      setCustomPrice(service.id, undefined);
                      setCustomPriceDraft('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </details>
          )}

          {/* Package options */}
          {service.pricing.priceType === 'package' && service.pricing.packages && service.pricing.packages.length > 0 && (
            <div className="rounded-xl border border-fog bg-white p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">Available package pricing</div>
              <div className="flex flex-wrap gap-2">
                {service.pricing.packages.map((pkg) => (
                  <button
                    key={pkg.quantity}
                    type="button"
                    onClick={() => setQuantity(service.id, pkg.quantity)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selection.quantity === pkg.quantity ? 'border-navy bg-paleBlue' : 'border-fog hover:border-slate'
                    }`}
                  >
                    <div className="font-medium text-ink">{pkg.label ?? `${pkg.quantity} sessions`}</div>
                    <div className="text-slate">{formatMoney(pkg.price)}</div>
                    {pkg.notes && <div className="mt-0.5 max-w-[14rem] text-[11px] text-[#0B6E5F]">{pkg.notes}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="rounded-xl border border-fog bg-white p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">Why we're recommending it</div>
            <p className="text-sm leading-relaxed text-ink/80">{service.standardBenefit}</p>
          </div>
          <div className="rounded-xl border border-dashed border-navy/30 bg-white p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy">For your plan (personalize)</div>
            <textarea
              value={selection.personalizedRecommendation ?? ''}
              onChange={(e) => setPersonalizedRecommendation(service.id, e.target.value)}
              placeholder="Add a note specific to this patient's goals — shown on their plan and PDF."
              rows={2}
              className="w-full resize-none rounded-lg border border-fog px-3 py-2 text-sm leading-relaxed focus:border-navy focus:outline-none"
            />
          </div>

          {service.protocol.protocolNotes && (
            <p className="text-xs text-slate">
              <span className="font-medium">Protocol note:</span> {service.protocol.protocolNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PricingMethodTag({ method, label }: { method: string; label?: string }) {
  const map: Record<string, { text: string; className: string }> = {
    individual: { text: 'Individual pricing', className: 'text-slate' },
    package: { text: label ?? 'Package pricing', className: 'text-[#0B6E5F]' },
    custom: { text: 'Custom price', className: 'text-navy' },
    unresolved: { text: 'Needs confirmation', className: 'text-[#8A5A00]' },
  };
  const m = map[method] ?? map.individual;
  return <div className={`mt-0.5 text-xs font-medium ${m.className}`}>{m.text}</div>;
}
