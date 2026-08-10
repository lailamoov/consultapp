import { create } from 'zustand';
import type { SelectedServiceState, TimingOverride } from '../types';
import { services, getServiceById } from '../data/services';
import { generateSchedule, checkSessionConflicts, type ConflictCheckResult, type GeneratedSession } from '../engine/scheduler';
import { toISODate } from '../utils/date';

const servicesById = Object.fromEntries(services.map((s) => [s.id, s]));

interface ConsultationStore {
  patientName: string;
  consultationDate: string;
  providerName: string;
  locationId: string | null;
  selectedServices: Record<string, SelectedServiceState>;
  planStartDate: string;
  schedule: GeneratedSession[];
  timingOverrides: TimingOverride[];
  financingTermMonths: 6 | 12 | 18 | null;
  activeConflicts: ConflictCheckResult[];

  setPatientInfo: (fields: Partial<{ patientName: string; consultationDate: string; providerName: string; locationId: string | null }>) => void;
  toggleService: (serviceId: string) => void;
  setQuantity: (serviceId: string, quantity: number) => void;
  setPricingQuantity: (serviceId: string, quantity: number) => void;
  setCustomPrice: (serviceId: string, price: number | undefined, reason?: string) => void;
  setPersonalizedRecommendation: (serviceId: string, text: string) => void;
  setPlanStartDate: (iso: string) => void;
  regenerateSchedule: () => void;
  moveSessionDate: (sessionId: string, newDateISO: string) => void;
  resolveConflictsForSession: (sessionId: string) => void;
  addOverride: (serviceAId: string, serviceBId: string, reason: string, overriddenBy: string) => void;
  setFinancingTerm: (months: 6 | 12 | 18 | null) => void;
  reset: () => void;
}

const today = toISODate(new Date());

export const useConsultationStore = create<ConsultationStore>((set, get) => ({
  patientName: '',
  consultationDate: today,
  providerName: '',
  locationId: null,
  selectedServices: {},
  planStartDate: today,
  schedule: [],
  timingOverrides: [],
  financingTermMonths: null,
  activeConflicts: [],

  setPatientInfo: (fields) => set(fields),

  toggleService: (serviceId) => {
    const service = getServiceById(serviceId);
    if (!service) return;
    set((state) => {
      const next = { ...state.selectedServices };
      if (next[serviceId]) {
        delete next[serviceId];
      } else {
        next[serviceId] = {
          serviceId,
          quantity: service.protocol.standardQuantity,
          pricingQuantity: service.hasSeparatePricingQuantity ? 0 : undefined,
          pricingMethod: 'individual',
          subtotal: 0,
        };
      }
      return { selectedServices: next };
    });
    get().regenerateSchedule();
  },

  setQuantity: (serviceId, quantity) => {
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [serviceId]: { ...state.selectedServices[serviceId], quantity: Math.max(0, quantity) },
      },
    }));
    get().regenerateSchedule();
  },

  setPricingQuantity: (serviceId, quantity) => {
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [serviceId]: { ...state.selectedServices[serviceId], pricingQuantity: Math.max(0, quantity) },
      },
    }));
  },

  setCustomPrice: (serviceId, price, reason) => {
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [serviceId]: { ...state.selectedServices[serviceId], customPrice: price, customPriceReason: reason },
      },
    }));
  },

  setPersonalizedRecommendation: (serviceId, text) => {
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [serviceId]: { ...state.selectedServices[serviceId], personalizedRecommendation: text },
      },
    }));
  },

  setPlanStartDate: (iso) => {
    set({ planStartDate: iso });
    get().regenerateSchedule();
  },

  regenerateSchedule: () => {
    const state = get();
    const selectedIds = Object.keys(state.selectedServices);
    const schedule = generateSchedule(selectedIds, servicesById, state.selectedServices, state.planStartDate);
    set({ schedule, activeConflicts: [] });
  },

  moveSessionDate: (sessionId, newDateISO) => {
    set((state) => ({
      schedule: state.schedule.map((s) => (s.id === sessionId ? { ...s, date: newDateISO, manuallyAdjusted: true } : s)),
    }));
    get().resolveConflictsForSession(sessionId);
  },

  resolveConflictsForSession: (sessionId) => {
    const state = get();
    const session = state.schedule.find((s) => s.id === sessionId);
    if (!session) {
      set({ activeConflicts: [] });
      return;
    }
    const conflicts = checkSessionConflicts(session, state.schedule, servicesById);
    set({ activeConflicts: conflicts });
  },

  addOverride: (serviceAId, serviceBId, reason, overriddenBy) => {
    set((state) => ({
      timingOverrides: [
        ...state.timingOverrides,
        { id: `override-${Date.now()}`, serviceAId, serviceBId, reason, overriddenBy, timestamp: new Date().toISOString() },
      ],
      activeConflicts: [],
    }));
  },

  setFinancingTerm: (months) => set({ financingTermMonths: months }),

  reset: () =>
    set({
      patientName: '',
      consultationDate: today,
      providerName: '',
      locationId: null,
      selectedServices: {},
      planStartDate: today,
      schedule: [],
      timingOverrides: [],
      financingTermMonths: null,
      activeConflicts: [],
    }),
}));

export { servicesById };
