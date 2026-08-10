import type { Service, SelectedServiceState, ScheduledSession } from '../types';
import { computeServicePricing } from './pricing';

export interface LineItem {
  service: Service;
  selection: SelectedServiceState;
  pricing: ReturnType<typeof computeServicePricing>;
}

export function buildLineItems(services: Record<string, Service>, selections: Record<string, SelectedServiceState>): LineItem[] {
  return Object.values(selections)
    .map((selection) => {
      const service = services[selection.serviceId];
      if (!service) return null;
      const pricing = computeServicePricing(service, selection);
      return { service, selection, pricing };
    })
    .filter((x): x is LineItem => x !== null);
}

export function getGrandTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + (item.pricing.subtotal || 0), 0);
}

export function hasUnresolvedPricing(lineItems: LineItem[]): boolean {
  return lineItems.some((item) => item.pricing.needsConfirmation);
}

/**
 * Estimated cost due at the first visit: per-session individual rate × the
 * number of sessions of that service actually scheduled on the plan start
 * date. This is an estimate for chairside conversation, not a billing
 * determination — package/custom pricing is often collected differently
 * (e.g. paid in full at booking), so front desk should confirm actual
 * collection amount when a package price applies.
 */
export function getTodaysVisitCost(lineItems: LineItem[], schedule: ScheduledSession[], planStartDateISO: string): number {
  let total = 0;
  for (const item of lineItems) {
    const sessionsToday = schedule.filter((s) => s.serviceId === item.service.id && s.date === planStartDateISO).length;
    if (sessionsToday === 0) continue;
    if (item.pricing.method === 'custom' && item.selection.quantity <= sessionsToday) {
      // Whole (small) plan happens today and a custom price was set for the whole plan.
      total += item.pricing.subtotal;
      continue;
    }
    // Deliberately NOT using pricing.unitPrice here: for perUnit services
    // (Botox per unit, Kybella per vial) the per-unit rate doesn't represent
    // "cost of one session" — the session's actual subtotal already reflects
    // units × rate, so divide the real subtotal across sessions instead.
    const perSessionRate = item.selection.quantity > 0 ? item.pricing.subtotal / item.selection.quantity : 0;
    total += perSessionRate * sessionsToday;
  }
  return total;
}
