import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
  /** When true, decreasing can drop below `min` all the way to 0 (to
   *  represent "not yet decided"), instead of floor-locking at `min`. */
  clearable = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  clearable?: boolean;
}) {
  const floor = clearable ? 0 : min;

  function handleIncrease() {
    // Jump straight to the minimum when starting from below it (e.g. a
    // service with a purchase minimum going from "not yet decided" to +1
    // should land on the minimum, not 1 unit below it).
    const next = value < min ? min : value + 1;
    onChange(Math.min(max, next));
  }

  return (
    <div className="inline-flex items-center rounded-full border border-fog bg-white">
      <button
        type="button"
        aria-label="Decrease"
        className="flex h-11 w-11 items-center justify-center rounded-full text-navy transition hover:bg-mist active:scale-95 disabled:opacity-30"
        onClick={() => onChange(Math.max(floor, value - 1))}
        disabled={value <= floor}
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
        onClick={handleIncrease}
        disabled={value >= max}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
