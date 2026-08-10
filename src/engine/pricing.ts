import type { Service, SelectedServiceState, PricingMethod } from '../types';

export interface PricingResult {
  method: PricingMethod;
  subtotal: number;
  /** Per-unit/per-session price used in the calculation, when applicable. */
  unitPrice?: number;
  /** The matched package tier, when pricingMethod === 'package'. */
  matchedPackageLabel?: string;
  /** True when the price shown requires the provider to confirm/enter a
   *  number before it can be trusted (range / variable / unavailable pricing
   *  with no custom price entered yet). */
  needsConfirmation: boolean;
  explanation: string;
}

/**
 * Computes the subtotal + pricing method for a single selected service,
 * following the rules from spec item 2:
 *  - If quantity matches an established package, apply the package price.
 *  - Otherwise, regular per-treatment price × quantity, unless an
 *    authorized custom price has been entered.
 *  - Range/variable/unavailable pricing always requires a custom price
 *    before it contributes a real number to totals.
 */
export function computeServicePricing(service: Service, selection: SelectedServiceState): PricingResult {
  const { pricing } = service;
  const quantity = selection.quantity ?? 0;
  const pricingQuantity = service.hasSeparatePricingQuantity ? selection.pricingQuantity ?? 0 : quantity;

  // A manually entered custom price always takes precedence when present —
  // this is the "authorized user enters an approved custom package price"
  // path, and also the only way range/variable/unavailable pricing resolves
  // to a real number.
  if (selection.customPrice !== undefined && selection.customPrice !== null) {
    return {
      method: 'custom',
      subtotal: selection.customPrice,
      needsConfirmation: false,
      explanation: selection.customPriceReason
        ? `Custom price entered: ${selection.customPriceReason}`
        : 'Custom price entered for this patient.',
    };
  }

  switch (pricing.priceType) {
    case 'complementary':
      return { method: 'individual', subtotal: 0, needsConfirmation: false, explanation: 'Complementary — no charge.' };

    case 'perUnit': {
      const unitPrice = pricing.individualPrice ?? 0;
      return {
        method: 'individual',
        subtotal: unitPrice * pricingQuantity,
        unitPrice,
        needsConfirmation: false,
        explanation: `${pricingQuantity} ${pricing.unitLabel ?? 'unit'}${pricingQuantity === 1 ? '' : 's'} × $${unitPrice}/${pricing.unitLabel ?? 'unit'}.`,
      };
    }

    case 'package': {
      const individualPrice = pricing.individualPrice ?? 0;
      const matchedPackage = pricing.packages?.find((p) => p.quantity === quantity);
      if (matchedPackage) {
        return {
          method: 'package',
          subtotal: matchedPackage.price,
          unitPrice: individualPrice,
          matchedPackageLabel: matchedPackage.label ?? `${matchedPackage.quantity}-session package`,
          needsConfirmation: false,
          explanation: `Matches the standard ${matchedPackage.quantity}-session package price.`,
        };
      }
      return {
        method: 'individual',
        subtotal: individualPrice * quantity,
        unitPrice: individualPrice,
        needsConfirmation: false,
        explanation: `${quantity} session${quantity === 1 ? '' : 's'} × $${individualPrice} (no package defined for this quantity).`,
      };
    }

    case 'fixed':
    case 'startingAt': {
      const unitPrice = pricing.individualPrice ?? 0;
      return {
        method: 'individual',
        subtotal: unitPrice * quantity,
        unitPrice,
        needsConfirmation: false,
        explanation:
          pricing.priceType === 'startingAt'
            ? `${quantity} × $${unitPrice}+ (starting price — confirm exact price for this patient if it varies).`
            : `${quantity} × $${unitPrice}.`,
      };
    }

    case 'range':
      return {
        method: 'unresolved',
        subtotal: 0,
        needsConfirmation: true,
        explanation: `Documented as $${pricing.rangeMin}–$${pricing.rangeMax}. Provider must confirm the exact price for this patient.`,
      };

    case 'variable':
      return {
        method: 'unresolved',
        subtotal: 0,
        needsConfirmation: true,
        explanation: 'Pricing varies by patient. Provider must enter the approved price.',
      };

    case 'unavailable':
      return {
        method: 'unresolved',
        subtotal: 0,
        needsConfirmation: true,
        explanation: 'No package pricing is on file for this service. Provider review required — enter an approved price.',
      };

    default:
      return { method: 'unresolved', subtotal: 0, needsConfirmation: true, explanation: 'Provider review required.' };
  }
}
