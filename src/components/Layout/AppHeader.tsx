import { FileDown } from 'lucide-react';
import { useConsultationStore } from '../../state/consultationStore';
import { locations } from '../../data/locations';

export function AppHeader({ onCreatePlan }: { onCreatePlan: () => void }) {
  const patientName = useConsultationStore((s) => s.patientName);
  const consultationDate = useConsultationStore((s) => s.consultationDate);
  const providerName = useConsultationStore((s) => s.providerName);
  const locationId = useConsultationStore((s) => s.locationId);
  const setPatientInfo = useConsultationStore((s) => s.setPatientInfo);

  return (
    <header className="sticky top-0 z-20 border-b border-fog bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-5 py-3">
        <img src="/brand/logos/MOOV.Horizontal.Logo.Blue.svg" alt="MOOV Health" className="h-7 shrink-0" />

        <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientInfo({ patientName: e.target.value })}
            placeholder="Patient name"
            className="w-36 rounded-lg border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none sm:w-44"
          />
          <input
            type="text"
            value={providerName}
            onChange={(e) => setPatientInfo({ providerName: e.target.value })}
            placeholder="Provider"
            className="w-32 rounded-lg border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none sm:w-36"
          />
          <input
            type="date"
            value={consultationDate}
            onChange={(e) => setPatientInfo({ consultationDate: e.target.value })}
            className="rounded-lg border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none"
          />
          {locations.length > 1 && (
            <select
              value={locationId ?? ''}
              onChange={(e) => setPatientInfo({ locationId: e.target.value || null })}
              className="rounded-lg border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none"
            >
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={onCreatePlan}
          className="flex shrink-0 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-navyDeep active:scale-[0.98]"
        >
          <FileDown size={16} />
          Create Patient Treatment Plan
        </button>
      </div>
    </header>
  );
}
