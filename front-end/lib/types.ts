// ─────────────────────────────────────────────────────────────────────────────
// types.ts — DRT Fleet Risk Tracker
// All domain types, enums, and interfaces for the maintenance risk system.
// ─────────────────────────────────────────────────────────────────────────────

/** Raw key-value row from a parsed CSV file. Keys are lowercased header names. */
export type MaintenanceCsvRow = Readonly<Record<string, string>>;

// ── Enums ────────────────────────────────────────────────────────────────────

export enum RiskLevel {
  CRITICAL = "CRITICAL",
  WARNING = "WARNING",
  STABLE = "STABLE",
}

export enum AssetType {
  CONVENTIONAL_BUS = "CONVENTIONAL_BUS",
  NON_CONVENTIONAL_ASSET = "NON_CONVENTIONAL_ASSET",
}

export enum DataFreshness {
  CURRENT = "CURRENT",
  STALE = "STALE",
  MISSING = "MISSING",
}

export enum AssetStatus {
  ACTIVE = "ACTIVE",
  OPERATING = "OPERATING",
  DOWN = "DOWN",
  UNKNOWN = "UNKNOWN",
}

export enum GarageLocation {
  Raleigh = "Raleigh",
  Westney = "Westney",
  Unknown = "Unknown",
}

// ── Core vehicle model ────────────────────────────────────────────────────────

/** Normalised, typed representation of a single transit vehicle from the CSV. */
export interface TransitVehicle {
  /** Bus number / asset alias (e.g. "8592") */
  readonly alias: string;
  /** Year / Make / Model string (e.g. "2014 - CONVENTIONAL NEW FLYER - 8592") */
  readonly assetDescription: string;
  /** Kilometres past the scheduled service trigger */
  readonly unitsLate: number;
  /** Calendar days past the scheduled service date */
  readonly daysLate: number;
  /** Allowed buffer before escalation (usually 1 000 km) */
  readonly tolerance: number;
  /** Odometer reading at which the next PM triggers */
  readonly nextTrigger: number;
  /** Current odometer reading */
  readonly lastReading: number;
  readonly location: GarageLocation;
  readonly status: AssetStatus;
}

// ── Risk scoring ──────────────────────────────────────────────────────────────

export interface RiskProfile {
  readonly score: number;
  readonly level: RiskLevel;
  readonly label: string;
}

// ── Full enriched asset record ────────────────────────────────────────────────

export interface BusRiskDetails {
  readonly busNumber: string;
  readonly assetDescription: string;
  readonly assetType: AssetType;
  readonly isConventionalBus: boolean;
  readonly location: GarageLocation;
  readonly assetStatus: AssetStatus;
  readonly reportDate: Date | null;

  // Odometer / service window
  readonly odometerKm: number;
  readonly nextServiceKm: number;
  /** Remaining km until PM trigger (can be negative when overdue) */
  readonly kmToNextService: number;

  // Lateness
  readonly unitsLate: number;
  readonly daysOverdue: number;
  readonly toleranceKm: number;

  // Risk
  readonly riskLevel: RiskLevel;
  readonly riskScore: number;
  readonly riskLabel: string;
  /** unitsLate ÷ tolerance */
  readonly riskRatio: number;
  /** How far past the hard tolerance (0 when within tolerance) */
  readonly overToleranceByKm: number;

  // Asset age
  readonly yearBuilt: number | null;
  readonly ageYears: number | null;

  // Job plan tracking
  readonly currentJobPlan: string;
  readonly nextJobPlan: string;

  // Delta vs previous snapshot (null when no previous data available)
  readonly unitsLateDelta: number | null;
  readonly daysLateDelta: number | null;

  // Data quality
  readonly dataFreshness: DataFreshness;
  readonly dataGaps: readonly string[];
  readonly riskFactors: readonly string[];
}

// ── Aggregate summaries ───────────────────────────────────────────────────────

export interface DepotRiskSummary {
  readonly location: GarageLocation;
  readonly totalAssets: number;
  readonly critical: number;
  readonly warning: number;
  readonly stable: number;
  readonly avgDaysOverdue: number;
}

export interface FleetRiskSummary {
  readonly totalAssets: number;
  readonly critical: number;
  readonly warning: number;
  readonly stable: number;
  /** Percentage of assets where unitsLate > 0 */
  readonly overduePercent: number;
}

export interface BusRiskReport {
  readonly assets: readonly BusRiskDetails[];
  readonly fleet: FleetRiskSummary;
  readonly depots: readonly DepotRiskSummary[];
}

// ── UI / filter types ─────────────────────────────────────────────────────────

export type RiskFilterValue = RiskLevel | "ALL";

export interface FilterState {
  readonly query: string;
  readonly riskLevel: RiskFilterValue;
}

/** Config passed into the UI renderer */
export interface AppConfig {
  readonly csvPaths: CsvPaths;
  readonly asOfDate: Date;
}

export interface CsvPaths {
  readonly current: string;
  readonly previous: string;
}
