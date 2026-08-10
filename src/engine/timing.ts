import type { Service, TimingProcedureKey, TimingRelationship, TimingRule, WaitSpec, CombinationProtocol } from '../types';
import { timingRules } from '../data/timingRules';
import { combinationProtocols } from '../data/combinationProtocols';
import { isAestheticService } from '../data/services';
import { addDays, diffInDays, isSameDay } from '../utils/date';

/** Directional lookup: if `from` is done, what must elapse before `to`? */
export function getDirectionalWait(from: TimingProcedureKey | null, to: TimingProcedureKey | null): TimingRule | undefined {
  if (!from || !to) return undefined;
  return timingRules.find((r) => r.from === from && r.to === to);
}

/** Finds an approved combination protocol whose sequence matches these two
 *  keys in this order (adjacent within the sequence, or the full pair for
 *  2-step protocols). Order matters. */
export function findCombinationProtocol(keyA: TimingProcedureKey, keyB: TimingProcedureKey): CombinationProtocol | undefined {
  return combinationProtocols.find((protocol) => {
    const idxA = protocol.sequence.indexOf(keyA);
    const idxB = protocol.sequence.indexOf(keyB);
    return idxA !== -1 && idxB !== -1 && idxA < idxB;
  });
}

function describeWait(wait: WaitSpec): string {
  if (wait.basis === 'no-data') return 'no established timing guidance';
  if (wait.basis === 'immediate') return 'may follow immediately';
  return `requires ${wait.sourceLabel} minimum`;
}

/**
 * Static (date-independent) relationship between two selected services —
 * used to render the "for every pair of selected treatments" compatibility
 * view in the consultation summary, before any dates are scheduled.
 */
export function getRelationshipInfo(serviceA: Service, serviceB: Service): TimingRelationship {
  const base = { serviceAId: serviceA.id, serviceBId: serviceB.id };

  // Only aesthetic-category services are covered by the MOOV Aesthetic
  // Procedure Timing Guide. Non-aesthetic services (wellness infusions, labs,
  // consultation) can be scheduled alongside anything with no restriction —
  // callers should not even present these pairs (see CompatibilityMatrix),
  // but this guard keeps the engine itself correct regardless of caller.
  if (!isAestheticService(serviceA) || !isAestheticService(serviceB)) {
    return {
      ...base,
      status: 'compatible-with-spacing',
      summary: 'At least one of these is a non-aesthetic wellness/lab service and is not subject to the aesthetic timing guide — it can be scheduled alongside any other treatment.',
    };
  }

  if (!serviceA.timingKey || !serviceB.timingKey) {
    return {
      ...base,
      status: 'provider-review-required',
      summary: 'No timing guidance is on file for at least one of these services. Provider review required before scheduling together.',
    };
  }

  if (serviceA.timingKey === serviceB.timingKey) {
    return {
      ...base,
      status: 'provider-review-required',
      summary: `Both map to the same MOOV procedure category (${serviceA.timingKey}). The timing guide does not give explicit guidance for combining two treatments in this category in one plan — clinical judgment applies.`,
    };
  }

  const protocol = findCombinationProtocol(serviceA.timingKey, serviceB.timingKey) ?? findCombinationProtocol(serviceB.timingKey, serviceA.timingKey);
  const aFirstWait = getDirectionalWait(serviceA.timingKey, serviceB.timingKey)?.wait;
  const bFirstWait = getDirectionalWait(serviceB.timingKey, serviceA.timingKey)?.wait;

  if (protocol && protocol.sameSession) {
    return {
      ...base,
      status: 'approved-same-day',
      summary: `Pre-approved same-day combination: ${protocol.label}. ${protocol.notes}`,
      notes: protocol.notes,
      aFirstWait,
      bFirstWait,
      combinationProtocol: protocol,
    };
  }

  if (!aFirstWait && !bFirstWait) {
    return {
      ...base,
      status: 'provider-review-required',
      summary: 'No established timing guidance exists for this pair in either order. Provider review required.',
    };
  }

  const parts: string[] = [];
  if (aFirstWait) parts.push(`If ${serviceA.name} is done first: ${describeWait(aFirstWait)} before ${serviceB.name}.`);
  if (bFirstWait) parts.push(`If ${serviceB.name} is done first: ${describeWait(bFirstWait)} before ${serviceA.name}.`);
  if (!aFirstWait) parts.push(`No guidance for ${serviceA.name} first — provider review required for that order.`);
  if (!bFirstWait) parts.push(`No guidance for ${serviceB.name} first — provider review required for that order.`);

  const ruleAB = getDirectionalWait(serviceA.timingKey, serviceB.timingKey);
  const ruleBA = getDirectionalWait(serviceB.timingKey, serviceA.timingKey);

  return {
    ...base,
    status: 'compatible-with-spacing',
    summary: parts.join(' '),
    notes: protocol?.notes ?? ruleAB?.notes ?? ruleBA?.notes,
    internalNote: ruleAB?.internalNote ?? ruleBA?.internalNote,
    aFirstWait,
    bFirstWait,
  };
}

export interface ScheduledPairEvaluation {
  status: TimingRelationship['status'];
  message: string;
  /** Earliest date the LATER of the two treatments could move to, to resolve a conflict. */
  earliestEligibleDate?: Date;
  notes?: string;
}

/**
 * Evaluates two ACTUAL scheduled dates for a pair of services. Used by the
 * scheduling algorithm and the calendar's live conflict checker.
 */
export function evaluateScheduledPair(serviceA: Service, dateA: Date, serviceB: Service, dateB: Date): ScheduledPairEvaluation {
  if (!isAestheticService(serviceA) || !isAestheticService(serviceB)) {
    return {
      status: 'compatible-with-spacing',
      message: `${serviceA.name} and ${serviceB.name}: at least one is a non-aesthetic wellness/lab service, not subject to timing restrictions.`,
    };
  }

  if (!serviceA.timingKey || !serviceB.timingKey) {
    return {
      status: 'provider-review-required',
      message: `No timing guidance on file for ${!serviceA.timingKey ? serviceA.name : serviceB.name}. Provider review required before confirming these dates together.`,
    };
  }

  if (serviceA.timingKey === serviceB.timingKey) {
    return {
      status: 'provider-review-required',
      message: `${serviceA.name} and ${serviceB.name} are both in the same MOOV procedure category. No explicit combined-session guidance on file — provider review required.`,
    };
  }

  const sameDay = isSameDay(dateA, dateB);
  const protocolEitherOrder = findCombinationProtocol(serviceA.timingKey, serviceB.timingKey) ?? findCombinationProtocol(serviceB.timingKey, serviceA.timingKey);

  if (sameDay) {
    if (protocolEitherOrder?.sameSession) {
      return { status: 'approved-same-day', message: `Approved same-day combination: ${protocolEitherOrder.label}. ${protocolEitherOrder.notes}`, notes: protocolEitherOrder.notes };
    }
    // Same day but not an explicit pre-approved protocol: only OK if BOTH
    // directional waits (where they exist) allow immediate/0-day.
    const aToB = getDirectionalWait(serviceA.timingKey, serviceB.timingKey);
    const bToA = getDirectionalWait(serviceB.timingKey, serviceA.timingKey);
    if (!aToB && !bToA) {
      return { status: 'provider-review-required', message: `No established timing guidance for same-day ${serviceA.name} + ${serviceB.name}. Provider review required.` };
    }
    const aOk = !aToB || aToB.wait.minDays === 0;
    const bOk = !bToA || bToA.wait.minDays === 0;
    if (aOk && bOk && (aToB || bToA)) {
      return { status: 'compatible-with-spacing', message: `${serviceA.name} and ${serviceB.name} may be performed same day per MOOV timing guidance (not an official pre-approved combination protocol).` };
    }
    const conflictingWait = !aOk ? aToB! : bToA!;
    const eligible = addDays(dateA, conflictingWait.wait.suggestedDays);
    return {
      status: 'conflict',
      message: `Timing Conflict: ${serviceA.name} and ${serviceB.name} should not be scheduled on the same day. Based on MOOV timing protocol, the next eligible date is ${eligible.toDateString()}.`,
      earliestEligibleDate: eligible,
    };
  }

  // Different days — determine chronological order and check the correct direction.
  const [firstService, firstDate, secondService, secondDate] = dateA <= dateB ? [serviceA, dateA, serviceB, dateB] : [serviceB, dateB, serviceA, dateA];
  const rule = getDirectionalWait(firstService.timingKey!, secondService.timingKey!);

  if (!rule) {
    return {
      status: 'provider-review-required',
      message: `No established timing guidance for ${firstService.name} followed by ${secondService.name}. Provider review required.`,
    };
  }

  const gapDays = diffInDays(firstDate, secondDate);
  if (gapDays >= rule.wait.minDays) {
    return {
      status: rule.wait.minDays === 0 ? 'compatible-with-spacing' : 'compatible-with-spacing',
      message: `${firstService.name} → ${secondService.name}: ${gapDays}-day gap satisfies the ${rule.wait.sourceLabel} minimum.`,
      notes: rule.notes,
    };
  }

  const eligible = addDays(firstDate, rule.wait.suggestedDays);
  return {
    status: 'conflict',
    message: `Timing Conflict: ${firstService.name} and ${secondService.name} should not be scheduled on these dates. Based on the MOOV timing protocol, the next eligible date is ${eligible.toDateString()}.`,
    earliestEligibleDate: eligible,
    notes: rule.notes,
  };
}

/** Earliest date `following` could be scheduled, given `preceding` already happened on `precedingDate`. Returns null if no guidance (provider review required — caller should not silently assume a date). */
export function earliestEligibleDateAfter(precedingService: Service, precedingDate: Date, followingService: Service): Date | null {
  if (!precedingService.timingKey || !followingService.timingKey) return null;
  if (precedingService.timingKey === followingService.timingKey) return null;
  const rule = getDirectionalWait(precedingService.timingKey, followingService.timingKey);
  if (!rule) return null;
  return addDays(precedingDate, rule.wait.suggestedDays);
}
