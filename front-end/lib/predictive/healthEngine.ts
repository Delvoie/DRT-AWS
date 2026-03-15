// lib/predictive/healthEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Core prediction algorithm.
//
// Option 1 (linear, default) — zero historical data needed.
// Option 2 (composite) — adds time-based decay alongside mileage.
//
// Health % drives all tags, notifications, and the health bar colour.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PartCategory,
  PartHealthRecord,
  PartTag,
  PartTagKey,
} from "@/lib/types/predictive";
import { getSeasonalMultiplier, seasonalReason } from "./seasonalModel";
import type { BusRecord, MaintenanceEntry, ServicePart } from "@/lib/types";

// ── Expected-life constants ───────────────────────────────────────────────────
// Derived from the PM CSV frequency field where available; falls back here.

export interface PartLifeSpec {
  expectedLifeKm:   number;
  expectedLifeDays: number;
  category:         PartCategory;
  mileageWeight:    number; // 0–1 (time weight = 1 - mileageWeight)
}

export const PART_LIFE_SPECS: Record<string, PartLifeSpec> = {
  // Keyed by lowercase partName substring — first match wins
  "engine oil":          { expectedLifeKm: 20_000,  expectedLifeDays: 90,  category: "fluid",      mileageWeight: 0.85 },
  "oil filter":          { expectedLifeKm: 20_000,  expectedLifeDays: 90,  category: "filter",     mileageWeight: 0.85 },
  "air filter":          { expectedLifeKm: 60_000,  expectedLifeDays: 365, category: "filter",     mileageWeight: 0.80 },
  "secondary air":       { expectedLifeKm: 60_000,  expectedLifeDays: 365, category: "filter",     mileageWeight: 0.80 },
  "fuel filter":         { expectedLifeKm: 40_000,  expectedLifeDays: 270, category: "filter",     mileageWeight: 0.80 },
  "2nd fuel filter":     { expectedLifeKm: 40_000,  expectedLifeDays: 270, category: "filter",     mileageWeight: 0.80 },
  "cool. filter":        { expectedLifeKm: 60_000,  expectedLifeDays: 365, category: "fluid",      mileageWeight: 0.60 },
  "coolant filter":      { expectedLifeKm: 60_000,  expectedLifeDays: 365, category: "fluid",      mileageWeight: 0.60 },
  "transmission filter": { expectedLifeKm: 150_000, expectedLifeDays: 730, category: "drivetrain", mileageWeight: 0.90 },
  "trans fld":           { expectedLifeKm: 150_000, expectedLifeDays: 730, category: "drivetrain", mileageWeight: 0.90 },
  "brake tr. clip":      { expectedLifeKm: 30_000,  expectedLifeDays: 180, category: "brake",      mileageWeight: 0.95 },
  "barium grease":       { expectedLifeKm: 30_000,  expectedLifeDays: 180, category: "brake",      mileageWeight: 0.90 },
  "hydraulic filter":    { expectedLifeKm: 80_000,  expectedLifeDays: 365, category: "filter",     mileageWeight: 0.75 },
  "crankcase filter":    { expectedLifeKm: 60_000,  expectedLifeDays: 365, category: "filter",     mileageWeight: 0.80 },
  "spinner cartridge":   { expectedLifeKm: 20_000,  expectedLifeDays: 90,  category: "filter",     mileageWeight: 0.85 },
  "dryer cartridge":     { expectedLifeKm: 100_000, expectedLifeDays: 365, category: "hvac",       mileageWeight: 0.60 },
  "wabasto":             { expectedLifeKm: 80_000,  expectedLifeDays: 365, category: "hvac",       mileageWeight: 0.40 },
  "webasto":             { expectedLifeKm: 80_000,  expectedLifeDays: 365, category: "hvac",       mileageWeight: 0.40 },
  "def. filter":         { expectedLifeKm: 100_000, expectedLifeDays: 365, category: "filter",     mileageWeight: 0.80 },
  "def filter":          { expectedLifeKm: 100_000, expectedLifeDays: 365, category: "filter",     mileageWeight: 0.80 },
  "internal trans":      { expectedLifeKm: 150_000, expectedLifeDays: 730, category: "drivetrain", mileageWeight: 0.90 },
};

const DEFAULT_SPEC: PartLifeSpec = {
  expectedLifeKm: 40_000, expectedLifeDays: 270,
  category: "filter", mileageWeight: 0.80,
};

export function getPartLifeSpec(partName: string): PartLifeSpec {
  const lower = partName.toLowerCase();
  for (const [key, spec] of Object.entries(PART_LIFE_SPECS)) {
    if (lower.includes(key)) return spec;
  }
  return DEFAULT_SPEC;
}

// ── Health computation (Option 2 — composite) ─────────────────────────────────

export function computeHealthPct(
  currentOdometerKm:  number,
  lastReplacedKm:     number,
  expectedLifeKm:     number,
  expectedLifeDays:   number,
  daysInService:      number,
  seasonalMultiplier: number,
  mileageWeight:      number,
): number {
  const timeWeight = 1 - mileageWeight;

  // Adjusted lifespans — seasonal multiplier shortens them
  const adjLifeKm   = expectedLifeKm   / seasonalMultiplier;
  const adjLifeDays = expectedLifeDays / seasonalMultiplier;

  const kmUsed     = Math.max(0, currentOdometerKm - lastReplacedKm);
  const kmDepleted = kmUsed / adjLifeKm;

  const days        = Math.max(0, daysInService);
  const timeDepleted = adjLifeDays > 0 ? days / adjLifeDays : 0;

  const combined = mileageWeight * kmDepleted + timeWeight * timeDepleted;
  return Math.max(0, Math.min(100, Math.round((1 - combined) * 1000) / 10));
}

// ── Projected failure km ──────────────────────────────────────────────────────

function projectFailureKm(
  currentOdometerKm: number,
  lastReplacedKm:    number,
  expectedLifeKm:    number,
  seasonalMultiplier: number,
): number | null {
  if (lastReplacedKm <= 0) return null;
  const adjLife = expectedLifeKm / seasonalMultiplier;
  return Math.round(lastReplacedKm + adjLife);
}

function projectFailureDate(
  currentOdometerKm:  number,
  lastReplacedKm:     number,
  expectedLifeKm:     number,
  expectedLifeDays:   number,
  daysInService:      number,
  seasonalMultiplier: number,
): Date | null {
  if (lastReplacedKm <= 0) return null;

  const adjLifeKm   = expectedLifeKm   / seasonalMultiplier;
  const adjLifeDays = expectedLifeDays / seasonalMultiplier;

  const kmUsed          = Math.max(0, currentOdometerKm - lastReplacedKm);
  const dailyKm         = daysInService > 0 ? kmUsed / daysInService : 200; // ~200 km/day fallback
  const kmRemaining     = Math.max(0, adjLifeKm - kmUsed);
  const daysRemByMile   = dailyKm > 0 ? kmRemaining / dailyKm : adjLifeDays;
  const daysRemByTime   = Math.max(0, adjLifeDays - daysInService);

  const daysToFailure   = Math.round((daysRemByMile + daysRemByTime) / 2);
  const result          = new Date();
  result.setDate(result.getDate() + daysToFailure);
  return result;
}

// Typical part lead time in days for ordering
const LEAD_TIME_DAYS = 5;

// ── Tag resolution ────────────────────────────────────────────────────────────

export function resolveTags(
  health:             number,
  seasonalMultiplier: number,
  category:           PartCategory,
  projectedFailureKm: number | null,
  currentOdometerKm:  number,
  lastReplacedKm:     number,
  expectedLifeKm:     number,
  daysInService:      number,
  orderByDate:        Date | null,
  snapshotDate:       Date,
): PartTag[] {
  const tags: PartTag[] = [];
  const kmRemaining = projectedFailureKm != null
    ? Math.max(0, projectedFailureKm - currentOdometerKm)
    : Infinity;

  const daysToOrder = orderByDate
    ? Math.ceil((orderByDate.getTime() - snapshotDate.getTime()) / 86_400_000)
    : Infinity;

  const kmUsed = Math.max(0, currentOdometerKm - lastReplacedKm);
  const isNew  = kmUsed < 10_000;

  // New install — don't pile on other tags
  if (isNew) {
    tags.push({
      key: "new_install", label: "New Install", colour: "green", urgent: false,
      reason: `Replaced ${kmUsed.toLocaleString()} km ago — health is high`,
    });
    return tags;
  }

  // Missing last-replaced data
  if (lastReplacedKm <= 0) {
    tags.push({
      key: "data_gap", label: "Data Gap", colour: "gray", urgent: false,
      reason: "No replacement history found — prediction uses conservative estimate",
    });
  }

  // Failure imminent
  if (health <= 20) {
    tags.push({
      key: "failure_risk", label: "Failure Risk", colour: "red", urgent: true,
      reason: `Health at ${health.toFixed(0)}% — failure likely within ${kmRemaining < Infinity ? kmRemaining.toLocaleString() + " km" : "days"}`,
    });
  }

  // Order now
  if (health <= 35 || daysToOrder <= LEAD_TIME_DAYS) {
    tags.push({
      key: "order_now", label: "Order Now", colour: "red", urgent: true,
      reason: `${kmRemaining < Infinity ? kmRemaining.toLocaleString() + " km" : "Time"} until failure — order now to beat ${LEAD_TIME_DAYS}-day lead time`,
    });
  } else if (health <= 55 || daysToOrder <= 14) {
    tags.push({
      key: "order_soon", label: "Order Soon", colour: "amber", urgent: false,
      reason: `Estimated failure in ${daysToOrder < Infinity ? daysToOrder + " days" : "~" + kmRemaining.toLocaleString() + " km"}`,
    });
  }

  // Seasonal risk
  const seasonBoost = Math.round((seasonalMultiplier - 1) * 100);
  if (seasonalMultiplier >= 1.3) {
    tags.push({
      key: "seasonal_risk", label: "Seasonal Risk", colour: "amber", urgent: false,
      reason: seasonalReason(category, snapshotDate) + ` (+${seasonBoost}% wear rate)`,
    });
  }

  // Winter stress specifically
  const month = snapshotDate.getMonth() + 1;
  if ((month <= 2 || month === 12) && seasonalMultiplier >= 1.3) {
    tags.push({
      key: "winter_stress", label: "Winter Stress", colour: "blue", urgent: false,
      reason: `Active Jan–Mar: cold-start, thermal cycling, road salt exposure`,
    });
  }

  // Summer heat
  if (month >= 6 && month <= 8 && seasonalMultiplier >= 1.3) {
    tags.push({
      key: "summer_heat", label: "Summer Heat", colour: "amber", urgent: false,
      reason: `Peak heat season — ${category === "hvac" ? "A/C at full load" : "heat soak accelerates wear"}`,
    });
  }

  // Mileage due (within 5,000 km of scheduled replacement)
  if (kmRemaining < 5_000 && kmRemaining > 0 && health > 20) {
    tags.push({
      key: "mileage_due", label: "Mileage Due", colour: "teal", urgent: false,
      reason: `${kmRemaining.toLocaleString()} km to scheduled replacement`,
    });
  }

  // Wear accelerated (degraded faster than the nominal schedule)
  const nominalHealthAtKm = Math.max(0, (1 - kmUsed / expectedLifeKm) * 100);
  if (health < nominalHealthAtKm - 15 && health > 20) {
    tags.push({
      key: "wear_accelerated", label: "Accelerated Wear", colour: "red", urgent: false,
      reason: `Health is ${(nominalHealthAtKm - health).toFixed(0)}% below nominal — degrading faster than expected`,
    });
  }

  return tags;
}

// ── Build a PartHealthRecord from a bus + part ────────────────────────────────

export function buildPartHealthRecord(
  busAlias:         string,
  part:             ServicePart,
  currentOdometerKm: number,
  maintenanceHistory: MaintenanceEntry[],
  snapshotDate:     Date = new Date(),
): import("@/lib/types/predictive").PartHealthRecord {
  const spec = getPartLifeSpec(part.partName);

  // Find the most recent maintenance entry that includes this part
  const lastEntry = maintenanceHistory
    .filter(e => e.partsUsed.some(p =>
      p.partNumber === part.partNumber ||
      p.partName.toLowerCase() === part.partName.toLowerCase()
    ))
    .sort((a, b) => b.odometerAtService - a.odometerAtService)[0];

  // Fallback: if no history, assume replaced halfway through expected life
  const lastReplacedKm = lastEntry?.odometerAtService
    ?? Math.max(0, currentOdometerKm - spec.expectedLifeKm * 0.5);

  const installDate = lastEntry?.completedDate ?? lastEntry?.scheduledDate ?? null;
  const daysInService = installDate
    ? Math.max(0, Math.round((snapshotDate.getTime() - installDate.getTime()) / 86_400_000))
    : Math.round(Math.max(0, currentOdometerKm - lastReplacedKm) / 200); // ~200 km/day

  const seasonalMultiplier = getSeasonalMultiplier(spec.category, snapshotDate);

  const healthPct = computeHealthPct(
    currentOdometerKm,
    lastReplacedKm,
    spec.expectedLifeKm,
    spec.expectedLifeDays,
    daysInService,
    seasonalMultiplier,
    spec.mileageWeight,
  );

  const projectedFailureKm   = projectFailureKm(currentOdometerKm, lastReplacedKm, spec.expectedLifeKm, seasonalMultiplier);
  const projectedFailureDate = projectFailureDate(currentOdometerKm, lastReplacedKm, spec.expectedLifeKm, spec.expectedLifeDays, daysInService, seasonalMultiplier);

  const orderByDate = projectedFailureDate
    ? new Date(projectedFailureDate.getTime() - LEAD_TIME_DAYS * 86_400_000)
    : null;

  const tags = resolveTags(
    healthPct, seasonalMultiplier, spec.category,
    projectedFailureKm, currentOdometerKm, lastReplacedKm,
    spec.expectedLifeKm, daysInService, orderByDate, snapshotDate,
  );

  return {
    busAlias,
    partName:            part.partName,
    partNumber:          part.partNumber,
    partCategory:        spec.category,
    healthPct,
    tags,
    odometerKm:          currentOdometerKm,
    lastReplacedKm,
    expectedLifeKm:      spec.expectedLifeKm,
    expectedLifeDays:    spec.expectedLifeDays,
    daysInService,
    seasonalMultiplier,
    projectedFailureKm,
    projectedFailureDate,
    orderByDate,
    snapshotDate,
  };
}

// ── Build all records for a BusRecord ────────────────────────────────────────

export function buildBusHealthRecords(
  bus: BusRecord,
  snapshotDate: Date = new Date(),
): import("@/lib/types/predictive").PartHealthRecord[] {
  const parts = bus.serviceSpec?.parts ?? [];
  return parts.map(part =>
    buildPartHealthRecord(
      bus.alias,
      part,
      bus.pm.odometerKm,
      bus.maintenanceHistory,
      snapshotDate,
    )
  );
}

// ── Fleet-level summary ───────────────────────────────────────────────────────

export function buildPredictiveFleetSummary(
  records: import("@/lib/types/predictive").PartHealthRecord[],
): import("@/lib/types/predictive").PredictiveFleetSummary {
  const total         = records.length;
  const critical      = records.filter(r => r.healthPct <= 20).length;
  const orderNow      = records.filter(r => r.tags.some(t => t.key === "order_now")).length;
  const orderSoon     = records.filter(r => r.tags.some(t => t.key === "order_soon")).length;
  const seasonalRisk  = records.filter(r => r.tags.some(t => t.key === "seasonal_risk")).length;
  const avgHealth     = total > 0
    ? Math.round(records.reduce((s, r) => s + r.healthPct, 0) / total)
    : 100;

  return {
    totalParts:        total,
    criticalCount:     critical,
    orderNowCount:     orderNow,
    orderSoonCount:    orderSoon,
    seasonalRiskCount: seasonalRisk,
    avgFleetHealth:    avgHealth,
  };
}
