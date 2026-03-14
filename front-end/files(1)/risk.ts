// ─────────────────────────────────────────────────────────────────────────────
// risk.ts — DRT Fleet Risk Tracker
// Pure domain logic: vehicle normalisation, risk scoring, and report assembly.
// No DOM, no side-effects — fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AssetStatus,
  AssetType,
  DataFreshness,
  GarageLocation,
  RiskLevel,
  type BusRiskDetails,
  type BusRiskReport,
  type DepotRiskSummary,
  type FleetRiskSummary,
  type MaintenanceCsvRow,
  type RiskProfile,
  type TransitVehicle,
} from "./types";

import { latestRowByAlias, parseCsv, safeParseDate, toNumber } from "./csv";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Assumed average km/day for scoring (used to convert days → km equivalent). */
const KM_PER_DAY_ESTIMATE = 71;

// ── Normalisation helpers ─────────────────────────────────────────────────────

export function normalizeLocation(locDescription: string): GarageLocation {
  const upper = locDescription.toUpperCase();
  if (upper.includes("RALEIGH")) return GarageLocation.Raleigh;
  if (upper.includes("WESTNEY")) return GarageLocation.Westney;
  return GarageLocation.Unknown;
}

export function normalizeStatus(raw: string): AssetStatus {
  switch (raw.trim().toUpperCase()) {
    case "DOWN":
      return AssetStatus.DOWN;
    case "OPERATING":
      return AssetStatus.OPERATING;
    case "ACTIVE":
      return AssetStatus.ACTIVE;
    default:
      return AssetStatus.UNKNOWN;
  }
}

/**
 * Determines whether the asset is a conventional transit bus.
 * Admin vehicles and UTVs are excluded; anything with an ODOMETER meter or
 * "CONVENTIONAL" in its description qualifies.
 */
export function isConventionalBus(
  assetDescription: string,
  meterName: string
): boolean {
  const desc = assetDescription.toUpperCase();
  const meter = meterName.toUpperCase();
  if (desc.includes("ADMIN") || desc.includes("UTV")) return false;
  return desc.includes("CONVENTIONAL") || meter === "ODOMETER";
}

/** Extracts a 4-digit year from an asset description string. */
export function extractYear(assetDescription: string): number | null {
  const match = assetDescription.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

/**
 * Classifies how fresh the data is relative to a reference date.
 * Reports older than 7 days are considered stale.
 */
export function classifyDataFreshness(
  reportDate: Date | null,
  asOfDate: Date
): DataFreshness {
  if (!reportDate) return DataFreshness.MISSING;
  const DAY_MS = 24 * 60 * 60 * 1_000;
  const ageDays = (asOfDate.getTime() - reportDate.getTime()) / DAY_MS;
  return ageDays <= 7 ? DataFreshness.CURRENT : DataFreshness.STALE;
}

// ── Risk calculation ──────────────────────────────────────────────────────────

/**
 * Calculates a risk profile for a single vehicle.
 *
 * Escalation rules (in priority order):
 *  1. Asset DOWN → CRITICAL immediately
 *  2. unitsLate > tolerance OR daysLate > 14 → CRITICAL
 *  3. unitsLate > tolerance × 0.5 OR daysLate > 7 → WARNING
 *  4. Otherwise → STABLE
 */
export function calculateVehicleRisk(vehicle: TransitVehicle): RiskProfile {
  const { unitsLate, daysLate, tolerance, status } = vehicle;

  if (status === AssetStatus.DOWN) {
    return {
      score: Math.max(unitsLate, tolerance),
      level: RiskLevel.CRITICAL,
      label: "Asset DOWN",
    };
  }

  if (unitsLate > tolerance || daysLate > 14) {
    return {
      score: Math.max(unitsLate, daysLate * KM_PER_DAY_ESTIMATE),
      level: RiskLevel.CRITICAL,
      label: `${unitsLate.toLocaleString()}km, ${daysLate}d Overdue`,
    };
  }

  if (unitsLate > tolerance * 0.5 || daysLate > 7) {
    return {
      score: unitsLate,
      level: RiskLevel.WARNING,
      label: `Due Soon (${daysLate}d)`,
    };
  }

  return { score: unitsLate, level: RiskLevel.STABLE, label: "Optimal" };
}

// ── Data-quality gap detection ────────────────────────────────────────────────

function deriveDataGaps(
  row: MaintenanceCsvRow,
  reportDate: Date | null
): string[] {
  const gaps: string[] = [];
  if (!row["alias"]) gaps.push("missing alias");
  if (!row["lastreading"]) gaps.push("missing lastreading");
  if (!row["nexttrigger"]) gaps.push("missing nexttrigger");
  if (!row["lastpmwogenread"]) gaps.push("missing lastpmwogenread");
  if (!reportDate) gaps.push("invalid or missing reportdate");
  return gaps;
}

// ── Row → vehicle normalisation ───────────────────────────────────────────────

function rowToVehicle(row: MaintenanceCsvRow): TransitVehicle {
  return {
    alias: row["alias"] ?? "",
    assetDescription: row["assetdescription"] ?? "",
    unitsLate: toNumber(row["unitslate"]),
    daysLate: toNumber(row["dayslate"]),
    tolerance: toNumber(row["tolerance"]),
    nextTrigger: toNumber(row["nexttrigger"]),
    lastReading: toNumber(row["lastreading"]),
    location: normalizeLocation(row["locdescription"] ?? ""),
    status: normalizeStatus(
      row["assetstatus"] ?? row["pmstatus"] ?? ""
    ),
  };
}

// ── Row → full risk details ───────────────────────────────────────────────────

function rowToRiskDetails(
  row: MaintenanceCsvRow,
  previousRow: MaintenanceCsvRow | null,
  asOfDate: Date
): BusRiskDetails {
  const vehicle = rowToVehicle(row);
  const risk = calculateVehicleRisk(vehicle);
  const reportDate = safeParseDate(row["reportdate"]);
  const yearBuilt = extractYear(vehicle.assetDescription);
  const conventional = isConventionalBus(
    row["assetdescription"] ?? "",
    row["metername"] ?? ""
  );

  const overToleranceByKm = Math.max(vehicle.unitsLate - vehicle.tolerance, 0);
  const riskRatio =
    vehicle.tolerance > 0 ? vehicle.unitsLate / vehicle.tolerance : 0;
  const freshness = classifyDataFreshness(reportDate, asOfDate);
  const dataGaps = deriveDataGaps(row, reportDate);

  const prevUnitsLate = previousRow ? toNumber(previousRow["unitslate"]) : null;
  const prevDaysLate = previousRow ? toNumber(previousRow["dayslate"]) : null;

  const riskFactors: string[] = [];
  if (vehicle.status === AssetStatus.DOWN) {
    riskFactors.push("asset marked DOWN");
  }
  if (vehicle.unitsLate > vehicle.tolerance) {
    riskFactors.push(`over tolerance by ${overToleranceByKm.toLocaleString()}km`);
  }
  if (vehicle.daysLate > 7) {
    riskFactors.push(`${vehicle.daysLate} days overdue`);
  }
  if (freshness !== DataFreshness.CURRENT) {
    riskFactors.push(`data freshness ${freshness.toLowerCase()}`);
  }
  if (!conventional) {
    riskFactors.push("non-conventional asset included");
  }
  if (riskFactors.length === 0) {
    riskFactors.push("no immediate red flags");
  }

  return {
    busNumber: vehicle.alias,
    assetDescription: vehicle.assetDescription,
    assetType: conventional
      ? AssetType.CONVENTIONAL_BUS
      : AssetType.NON_CONVENTIONAL_ASSET,
    isConventionalBus: conventional,
    location: vehicle.location,
    assetStatus: vehicle.status,
    reportDate,
    odometerKm: vehicle.lastReading,
    nextServiceKm: vehicle.nextTrigger,
    kmToNextService: toNumber(row["unitstogo"]),
    unitsLate: vehicle.unitsLate,
    daysOverdue: vehicle.daysLate,
    toleranceKm: vehicle.tolerance,
    riskLevel: risk.level,
    riskScore: risk.score,
    riskLabel: risk.label,
    riskRatio,
    overToleranceByKm,
    yearBuilt,
    ageYears: yearBuilt != null ? asOfDate.getFullYear() - yearBuilt : null,
    currentJobPlan: row["curjpdescription"] ?? "",
    nextJobPlan: row["jpdescription"] ?? "",
    unitsLateDelta:
      prevUnitsLate === null ? null : vehicle.unitsLate - prevUnitsLate,
    daysLateDelta:
      prevDaysLate === null ? null : vehicle.daysLate - prevDaysLate,
    dataFreshness: freshness,
    dataGaps,
    riskFactors,
  };
}

// ── Sorting ───────────────────────────────────────────────────────────────────

function rankRisk(level: RiskLevel): number {
  switch (level) {
    case RiskLevel.CRITICAL:
      return 3;
    case RiskLevel.WARNING:
      return 2;
    case RiskLevel.STABLE:
      return 1;
  }
}

function sortAssets(assets: BusRiskDetails[]): BusRiskDetails[] {
  return [...assets].sort((a, b) => {
    const riskDiff = rankRisk(b.riskLevel) - rankRisk(a.riskLevel);
    if (riskDiff !== 0) return riskDiff;
    if (b.unitsLate !== a.unitsLate) return b.unitsLate - a.unitsLate;
    return b.daysOverdue - a.daysOverdue;
  });
}

// ── Depot summary ─────────────────────────────────────────────────────────────

function summarizeDepot(
  assets: readonly BusRiskDetails[],
  location: GarageLocation
): DepotRiskSummary {
  const scoped = assets.filter((a) => a.location === location);
  const totalAssets = scoped.length;
  const totalDays = scoped.reduce((sum, a) => sum + a.daysOverdue, 0);

  return {
    location,
    totalAssets,
    critical: scoped.filter((a) => a.riskLevel === RiskLevel.CRITICAL).length,
    warning: scoped.filter((a) => a.riskLevel === RiskLevel.WARNING).length,
    stable: scoped.filter((a) => a.riskLevel === RiskLevel.STABLE).length,
    avgDaysOverdue:
      totalAssets > 0
        ? Number((totalDays / totalAssets).toFixed(2))
        : 0,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Builds a complete BusRiskReport from raw CSV text snapshots.
 *
 * @param currentSnapshotCsv  - The most recent Maximo PM export
 * @param previousSnapshotCsv - An older snapshot used for delta calculations
 * @param asOfDate            - The reference date (defaults to today)
 */
export function buildBusRiskReport(
  currentSnapshotCsv: string,
  previousSnapshotCsv?: string,
  asOfDate: Date = new Date()
): BusRiskReport {
  const currentRows = parseCsv(currentSnapshotCsv);
  const previousRows = previousSnapshotCsv ? parseCsv(previousSnapshotCsv) : [];

  const currentByAlias = latestRowByAlias(currentRows);
  const previousByAlias = latestRowByAlias(previousRows);

  const assets = sortAssets(
    Array.from(currentByAlias.values()).map((row) =>
      rowToRiskDetails(
        row,
        previousByAlias.get(row["alias"] ?? "") ?? null,
        asOfDate
      )
    )
  );

  const overdue = assets.filter((a) => a.unitsLate > 0).length;

  const fleet: FleetRiskSummary = {
    totalAssets: assets.length,
    critical: assets.filter((a) => a.riskLevel === RiskLevel.CRITICAL).length,
    warning: assets.filter((a) => a.riskLevel === RiskLevel.WARNING).length,
    stable: assets.filter((a) => a.riskLevel === RiskLevel.STABLE).length,
    overduePercent:
      assets.length > 0
        ? Number(((overdue / assets.length) * 100).toFixed(2))
        : 0,
  };

  const depots = (
    [GarageLocation.Raleigh, GarageLocation.Westney, GarageLocation.Unknown] as const
  )
    .map((loc) => summarizeDepot(assets, loc))
    .filter((d) => d.totalAssets > 0);

  return { assets, fleet, depots };
}
