import { useMemo, useState } from 'react';
import { AppHeader } from './components/Layout/AppHeader';
import { ServiceCatalog } from './components/ServiceCatalog/ServiceCatalog';
import { CalendarView } from './components/Calendar/CalendarView';
import { SummaryPanel } from './components/Summary/SummaryPanel';
import { CompatibilityMatrix } from './components/Summary/CompatibilityMatrix';
import { FinancingEstimator } from './components/Financing/FinancingEstimator';
import { useConsultationStore, servicesById } from './state/consultationStore';
import { buildLineItems, getGrandTotal, getTodaysVisitCost } from './engine/consultationSelectors';
import { formatMoney } from './utils/format';
import { ClipboardList, CalendarRange } from 'lucide-react';

type Tab = 'plan' | 'timeline';

function App() {
  const [tab, setTab] = useState<Tab>('plan');
  const [generating, setGenerating] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const patientName = useConsultationStore((s) => s.patientName);
  const consultationDate = useConsultationStore((s) => s.consultationDate);
  const providerName = useConsultationStore((s) => s.providerName);
  const selectedServices = useConsultationStore((s) => s.selectedServices);
  const schedule = useConsultationStore((s) => s.schedule);
  const planStartDate = useConsultationStore((s) => s.planStartDate);

  const lineItems = useMemo(() => buildLineItems(servicesById, selectedServices), [selectedServices]);
  const grandTotal = useMemo(() => getGrandTotal(lineItems), [lineItems]);
  const todaysCost = useMemo(() => getTodaysVisitCost(lineItems, schedule, planStartDate), [lineItems, schedule, planStartDate]);

  async function handleCreatePlan() {
    if (lineItems.length === 0) return;
    setGenerating(true);
    try {
      const { downloadPatientPlanPdf } = await import('./pdf/generate');
      await downloadPatientPlanPdf({
        patientName,
        consultationDate,
        providerName,
        lineItems,
        grandTotal,
        todaysCost,
        schedule,
        servicesById,
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <AppHeader onCreatePlan={handleCreatePlan} />

      <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-5 lg:pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <main>
            <div className="mb-5 flex gap-2 rounded-full border border-fog bg-white p-1 sm:inline-flex">
              <TabButton icon={<ClipboardList size={16} />} label="Treatment Plan" active={tab === 'plan'} onClick={() => setTab('plan')} />
              <TabButton icon={<CalendarRange size={16} />} label="12-Month Calendar" active={tab === 'timeline'} onClick={() => setTab('timeline')} />
            </div>

            {tab === 'plan' ? (
              <div className="space-y-6">
                <ServiceCatalog />
                <CompatibilityMatrix />
              </div>
            ) : (
              <CalendarView />
            )}
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-[5.5rem] space-y-5">
              <div className="rounded-2xl border border-fog bg-white p-5 shadow-panel">
                <h3 className="mb-3 font-display text-base font-semibold text-ink">Consultation Summary</h3>
                <SummaryPanel />
              </div>
              <FinancingEstimator />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile/tablet-portrait summary drawer trigger */}
      {lineItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-fog bg-white p-3 shadow-panel lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="flex w-full items-center justify-between rounded-full bg-navy px-5 py-3 text-white"
          >
            <span className="text-sm font-medium">{lineItems.length} service{lineItems.length === 1 ? '' : 's'} selected</span>
            <span className="font-display text-base font-semibold">{formatMoney(grandTotal)}</span>
          </button>
        </div>
      )}

      {summaryOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-ink/40 lg:hidden" onClick={() => setSummaryOpen(false)}>
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink">Consultation Summary</h3>
              <button className="text-sm text-slate" onClick={() => setSummaryOpen(false)}>
                Close
              </button>
            </div>
            <SummaryPanel />
            <div className="mt-5">
              <FinancingEstimator />
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-panel">Preparing patient plan…</div>
        </div>
      )}
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
        active ? 'bg-navy text-white' : 'text-ink/70 hover:bg-mist'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
