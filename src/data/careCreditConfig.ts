import type { CareCreditConfig } from '../types';

// -----------------------------------------------------------------------
// Source: supplied CareCredit "No Interest if Paid in Full" promotional
// merchant reference sheet (6 / 12 / 18 month tiers, $200+ purchases).
// All figures below are taken directly from that reference. Do not add
// promotional tiers, minimums, or APR figures that aren't in the supplied
// merchant material — if CareCredit changes terms, update this file only.
// -----------------------------------------------------------------------
export const careCreditConfig: CareCreditConfig = {
  globalMinPurchase: 200,
  tiers: [
    { months: 6, minPurchaseAmount: 200, minMonthlyPayment: 29 },
    { months: 12, minPurchaseAmount: 200, minMonthlyPayment: 29 },
    { months: 18, minPurchaseAmount: 200, minMonthlyPayment: 29 },
  ],
  standardApr: 26.99,
  minInterestCharge: 2,
  disclosure:
    'No Interest if Paid in Full within 6, 12, or 18 Months* on purchases of $200 or more with your CareCredit credit card. ' +
    'Interest will be charged to your account from the purchase date if the promotional (promo) purchase is not paid in full ' +
    'within the promotional period. Minimum monthly payments are required. Required monthly payments may or may not pay off ' +
    'the purchase before the end of the promotional period. Optional equal monthly payments may be greater than the required ' +
    'minimum monthly payment and, if made on time every month with no other balance on the account, would pay off the promotional ' +
    'purchase within the promotional period. *No interest will be charged on the promo purchase if you pay it off in full within ' +
    'the promo period. If you do not, interest will be charged on the promo purchase from the purchase date. Regular account terms ' +
    'apply to non-promo purchases and, after the promo period ends, to the promo balance. For new accounts: Purchase APR is 26.99%; ' +
    'Minimum Interest Charge is $2. Existing cardholders should see their credit card agreement terms. Subject to credit approval. ' +
    'Not all enrolled healthcare providers offer all promotional financing options — ask your provider for details. For purchases ' +
    'less than $200, standard account terms apply.',
  paymentOnlyDisclaimer:
    'Estimated payment only. Actual financing terms and approval are determined solely by CareCredit / Synchrony Bank. This is not ' +
    'an offer of credit and does not guarantee approval or these terms.',
};
