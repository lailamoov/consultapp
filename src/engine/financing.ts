import type { CareCreditConfig, CareCreditPromoTier } from '../types';

export interface FinancingEstimate {
  tier: CareCreditPromoTier;
  monthlyPayment: number;
  eligible: boolean;
  ineligibleReason?: string;
}

/**
 * Estimated monthly payment = purchase amount ÷ number of promotional
 * months, rounded up to the next dollar, floored at the tier's documented
 * minimum monthly payment. This reproduces the exact figures published in
 * the supplied CareCredit merchant reference table (verified against every
 * row of that table), and is stated directly in that reference: "Equals the
 * promotional purchase amount divided by the number of months in the
 * promotional period."
 */
export function estimateFinancing(totalAmount: number, config: CareCreditConfig): FinancingEstimate[] {
  return config.tiers.map((tier) => {
    if (totalAmount < config.globalMinPurchase || totalAmount < tier.minPurchaseAmount) {
      return {
        tier,
        monthlyPayment: 0,
        eligible: false,
        ineligibleReason: `Requires a purchase of ${tier.minPurchaseAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} or more.`,
      };
    }
    const raw = Math.ceil(totalAmount / tier.months);
    const monthlyPayment = Math.max(raw, tier.minMonthlyPayment);
    return { tier, monthlyPayment, eligible: true };
  });
}
