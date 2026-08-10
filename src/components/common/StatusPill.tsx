import type { TimingRelationshipStatus } from '../../types';

const STYLES: Record<TimingRelationshipStatus, { bg: string; text: string; dot: string; label: string }> = {
  'approved-same-day': { bg: 'bg-[#E6FFF9]', text: 'text-[#0B6E5F]', dot: 'bg-[#00A896]', label: 'Approved same-day combination' },
  'compatible-with-spacing': { bg: 'bg-paleBlue', text: 'text-navy', dot: 'bg-link', label: 'Compatible with required spacing' },
  'provider-review-required': { bg: 'bg-[#FFF6E5]', text: 'text-[#8A5A00]', dot: 'bg-[#E0A100]', label: 'Provider review required' },
  conflict: { bg: 'bg-[#FDE9E7]', text: 'text-[#9B2C1F]', dot: 'bg-[#D14A3C]', label: 'Timing conflict' },
};

export function StatusPill({ status, label }: { status: TimingRelationshipStatus; label?: string }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? s.label}
    </span>
  );
}

export function statusLabel(status: TimingRelationshipStatus): string {
  return STYLES[status].label;
}
