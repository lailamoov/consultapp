import type { Service, SelectedServiceState, ScheduledSession, TimingRelationshipStatus } from '../types';
import { combinationProtocols } from '../data/combinationProtocols';
import { evaluateScheduledPair } from './timing';
import { addDays, diffInDays, fromISODate, toISODate } from '../utils/date';

interface UnitMember {
  serviceId: string;
  sessionNumber: number;
}

interface PlacementUnit {
  idealDate: Date;
  /** 2+ members means these were generated together by a same-session
   *  combination protocol and must always move together, on the same date. */
  members: UnitMember[];
}

interface Group {
  serviceIds: string[];
  intervalDays: number;
  sessionCount: number;
}

/** Groups selected services that match a same-session combination protocol,
 *  so their sessions are generated on shared dates rather than independently. */
function buildGroups(selectedServiceIds: string[], services: Record<string, Service>, selections: Record<string, SelectedServiceState>): { groups: Group[]; ungrouped: string[] } {
  const merged = new Set<string>();
  const groups: Group[] = [];

  for (const protocol of combinationProtocols.filter((p) => p.sameSession)) {
    const matching = selectedServiceIds.filter((id) => {
      const svc = services[id];
      return svc?.timingKey && protocol.sequence.includes(svc.timingKey) && !merged.has(id);
    });
    if (matching.length >= 2) {
      matching.sort((a, b) => protocol.sequence.indexOf(services[a].timingKey!) - protocol.sequence.indexOf(services[b].timingKey!));
      const intervalDays = Math.max(...matching.map((id) => services[id].protocol.sessionIntervalDays ?? 0));
      const sessionCount = Math.max(...matching.map((id) => selections[id]?.quantity ?? 0));
      groups.push({ serviceIds: matching, intervalDays, sessionCount });
      matching.forEach((id) => merged.add(id));
    }
  }

  const ungrouped = selectedServiceIds.filter((id) => !merged.has(id));
  return { groups, ungrouped };
}

function buildIdealUnits(selectedServiceIds: string[], services: Record<string, Service>, selections: Record<string, SelectedServiceState>, planStartDate: Date): PlacementUnit[] {
  const { groups, ungrouped } = buildGroups(selectedServiceIds, services, selections);
  const units: PlacementUnit[] = [];

  for (const group of groups) {
    for (let i = 0; i < group.sessionCount; i++) {
      const idealDate = addDays(planStartDate, i * group.intervalDays);
      const members: UnitMember[] = [];
      for (const serviceId of group.serviceIds) {
        const quantity = selections[serviceId]?.quantity ?? 0;
        if (i < quantity) members.push({ serviceId, sessionNumber: i + 1 });
      }
      if (members.length > 0) units.push({ idealDate, members });
    }
  }

  for (const serviceId of ungrouped) {
    const service = services[serviceId];
    const quantity = selections[serviceId]?.quantity ?? 0;
    const interval = service.protocol.sessionIntervalDays;
    for (let i = 0; i < quantity; i++) {
      const idealDate = interval ? addDays(planStartDate, i * interval) : planStartDate;
      units.push({ idealDate, members: [{ serviceId, sessionNumber: i + 1 }] });
    }
  }

  units.sort((a, b) => a.idealDate.getTime() - b.idealDate.getTime() || a.members[0].serviceId.localeCompare(b.members[0].serviceId));
  return units;
}

export interface GeneratedSession extends ScheduledSession {
  status: TimingRelationshipStatus | 'ok';
  conflictMessage?: string;
}

/**
 * Generates the full proposed schedule: builds ideal per-service dates from
 * standard protocol (grouping pre-approved same-session combinations into
 * atomic placement units that always move together), then places units in
 * ideal-date order, running every new unit through the compatibility engine
 * against everything already placed and pushing the WHOLE unit forward to
 * the earliest eligible date whenever a real conflict is found. Because
 * already-placed sessions are immutable once placed and the candidate date
 * only ever moves forward, resolving against every prior session (iterating
 * until nothing moves) yields the earliest date consistent with all of
 * those constraints simultaneously — not just the first one checked. Manual
 * overrides are applied on top afterward by the caller (see moveSession in
 * the store) — this function always produces the algorithm's own proposal.
 */
export function generateSchedule(selectedServiceIds: string[], services: Record<string, Service>, selections: Record<string, SelectedServiceState>, planStartDateISO: string): GeneratedSession[] {
  const planStartDate = fromISODate(planStartDateISO);
  const units = buildIdealUnits(selectedServiceIds, services, selections, planStartDate);
  const placed: GeneratedSession[] = [];
  const lastDateForService: Record<string, Date> = {};

  for (const unit of units) {
    let candidate = unit.idealDate;

    // Preserve intra-service spacing relative to the actual (possibly
    // shifted) previous session of each member's service.
    for (const member of unit.members) {
      const service = services[member.serviceId];
      const priorDate = lastDateForService[member.serviceId];
      if (priorDate && service.protocol.sessionIntervalDays) {
        const minNext = addDays(priorDate, service.protocol.sessionIntervalDays);
        if (minNext > candidate) candidate = minNext;
      }
    }

    const memberStatus: Record<string, TimingRelationshipStatus | 'ok'> = {};
    const memberMessage: Record<string, string | undefined> = {};
    unit.members.forEach((m) => (memberStatus[m.serviceId] = 'ok'));

    // Each already-placed session can force the candidate to "flip" from its
    // tentative before-B ordering to after-B at most once (evaluateScheduledPair
    // only ever pushes the candidate forward, never back), and once flipped it
    // stays satisfied as the candidate keeps growing. So a full pass per
    // placed session is always enough to reach a fixpoint — cap generously
    // above that bound purely as a safety net, not because more should ever
    // be needed.
    const maxIterations = placed.length + 5;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let moved = false;
      for (const existing of placed) {
        const existingService = services[existing.serviceId];
        for (const member of unit.members) {
          // Sessions of the SAME service are spaced via lastDateForService
          // above, not the cross-procedure compatibility engine — comparing
          // a service's own sessions there would incorrectly flag them as
          // "different services, same category, provider review required."
          if (existing.serviceId === member.serviceId) continue;
          const service = services[member.serviceId];
          const evalResult = evaluateScheduledPair(service, candidate, existingService, fromISODate(existing.date));
          if (evalResult.status === 'conflict' && evalResult.earliestEligibleDate && evalResult.earliestEligibleDate > candidate) {
            candidate = evalResult.earliestEligibleDate;
            moved = true;
          } else if (evalResult.status === 'approved-same-day') {
            if (memberStatus[member.serviceId] === 'ok') memberStatus[member.serviceId] = 'approved-same-day';
          } else if (evalResult.status === 'provider-review-required' && memberStatus[member.serviceId] === 'ok') {
            memberStatus[member.serviceId] = 'provider-review-required';
            memberMessage[member.serviceId] = evalResult.message;
          }
        }
      }
      if (!moved) break;
    }

    // Members placed together by a pre-approved same-session protocol are,
    // by construction, an approved same-day combination with each other.
    if (unit.members.length > 1) {
      unit.members.forEach((m) => {
        if (memberStatus[m.serviceId] === 'ok') memberStatus[m.serviceId] = 'approved-same-day';
      });
    }

    for (const member of unit.members) {
      placed.push({
        id: `${member.serviceId}-${member.sessionNumber}`,
        serviceId: member.serviceId,
        sessionNumber: member.sessionNumber,
        date: toISODate(candidate),
        manuallyAdjusted: false,
        status: memberStatus[member.serviceId],
        conflictMessage: memberMessage[member.serviceId],
      });
      lastDateForService[member.serviceId] = candidate;
    }
  }

  return placed;
}

export interface ConflictCheckResult {
  sessionId: string;
  otherSessionId: string;
  status: TimingRelationshipStatus;
  message: string;
  earliestEligibleDate?: string;
}

/** Checks one session's date against every other session in the schedule —
 *  used after a manual drag/date change, without auto-moving anything. */
export function checkSessionConflicts(session: ScheduledSession, schedule: ScheduledSession[], services: Record<string, Service>): ConflictCheckResult[] {
  const results: ConflictCheckResult[] = [];
  const service = services[session.serviceId];
  const sessionDate = fromISODate(session.date);
  const interval = service.protocol.sessionIntervalDays;

  for (const other of schedule) {
    if (other.id === session.id) continue;

    // Sessions of the SAME service: check the service's own minimum spacing
    // directly, rather than the cross-procedure compatibility engine.
    if (other.serviceId === session.serviceId) {
      if (!interval) continue;
      const otherDate = fromISODate(other.date);
      const [earlier, later] = sessionDate <= otherDate ? [sessionDate, otherDate] : [otherDate, sessionDate];
      const gap = diffInDays(earlier, later);
      if (gap < interval) {
        results.push({
          sessionId: session.id,
          otherSessionId: other.id,
          status: 'conflict',
          message: `Timing Conflict: ${service.name} sessions should be spaced at least ${interval} days apart per standard protocol (${service.protocol.frequencyLabel}). The next eligible date is ${toISODate(addDays(earlier, interval))}.`,
          earliestEligibleDate: toISODate(addDays(earlier, interval)),
        });
      }
      continue;
    }

    const otherService = services[other.serviceId];
    const evalResult = evaluateScheduledPair(service, sessionDate, otherService, fromISODate(other.date));
    if (evalResult.status === 'conflict' || evalResult.status === 'provider-review-required') {
      results.push({
        sessionId: session.id,
        otherSessionId: other.id,
        status: evalResult.status,
        message: evalResult.message,
        earliestEligibleDate: evalResult.earliestEligibleDate ? toISODate(evalResult.earliestEligibleDate) : undefined,
      });
    }
  }
  return results;
}
