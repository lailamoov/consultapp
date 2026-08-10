import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-fog bg-white">
      <button
        type="button"
        aria-label="Decrease"
        className="flex h-11 w-11 items-center justify-center rounded-full text-navy transition hover:bg-mist active:scale-95 disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus size={18} />
      </button>
      <div className="min-w-[3rem] text-center font-display text-base font-medium text-ink tabular-nums">
        {value}
        {suffix ? <span className="ml-1 text-xs font-normal text-slate">{suffix}</span> : null}
      </div>
      <button
        type="button"
        aria-label="Increase"
        className="flex h-11 w-11 items-center justify-center rounded-full text-navy transition hover:bg-mist active:scale-95 disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
