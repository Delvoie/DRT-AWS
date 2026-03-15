// lib/predictive/mockPredictiveData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Generates mock PartHealthRecords and PredictiveNotifications for all buses.
// Uses the real getMockBuses() bus data so records are always consistent.
// ─────────────────────────────────────────────────────────────────────────────

import { getMockBuses } from "@/lib/mockData";
import { buildBusHealthRecords, buildPredictiveFleetSummary } from "./healthEngine";
// import { generateNotifications } from "./notificationEngine";
import type { PartHealthRecord, PredictiveNotification, PredictiveFleetSummary } from "@/lib/types/predictive";

const AS_OF = new Date("2026-03-15T00:00:00"); // matches project date

// ── Cached data (stable across re-renders in dev) ─────────────────────────────

let _records:       PartHealthRecord[]       | null = null;
let _notifications: PredictiveNotification[] | null = null;
let _summary:       PredictiveFleetSummary   | null = null;

export function getMockPartHealthRecords(): PartHealthRecord[] {
  if (!_records) {
    const buses = getMockBuses();
    _records = buses.flatMap(bus => buildBusHealthRecords(bus, AS_OF));
  }
  return _records;
}

// export function getMockNotifications(): PredictiveNotification[] {
//   if (!_notifications) {
//     _notifications = generateNotifications(getMockPartHealthRecords(), [], AS_OF);
//   }
//   return _notifications;
// }

export function getMockPredictiveSummary(): PredictiveFleetSummary {
  if (!_summary) {
    _summary = buildPredictiveFleetSummary(getMockPartHealthRecords());
  }
  return _summary;
}

export function getMockRecordsForBus(alias: string): PartHealthRecord[] {
  return getMockPartHealthRecords().filter(r => r.busAlias === alias);
}

/** Reset caches — useful in tests or when mock bus data changes. */
export function resetMockCache() {
  _records       = null;
  _notifications = null;
  _summary       = null;
}
