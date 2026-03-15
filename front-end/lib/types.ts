// lib/types.ts
// Single source of truth for ALL types across FleetRiskTracker + PartsInventory.

export type MaintenanceCsvRow = Readonly<Record<string, string>>;

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum RiskLevel {
  Critical = "CRITICAL",
  Warning  = "WARNING",
  Stable   = "STABLE",
}

export enum GarageLocation {
  Raleigh = "Raleigh",
  Westney = "Westney",
  Unknown = "Unknown",
}

export enum ServiceLevel {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
}

export enum BusManufacturer {
  NewFlyer = "New Flyer",
  Nova     = "Nova",
  Admin    = "Admin",
  Unknown  = "Unknown",
}

export enum MaintenanceStatus {
  Pending    = "PENDING",
  InProgress = "IN_PROGRESS",
  Complete   = "COMPLETE",
  Overdue    = "OVERDUE",
  Cancelled  = "CANCELLED",
}

export enum AssetType {
  CONVENTIONAL_BUS       = "CONVENTIONAL_BUS",
  NON_CONVENTIONAL_ASSET = "NON_CONVENTIONAL_ASSET",
}

export enum DataFreshness {
  CURRENT = "CURRENT",
  STALE   = "STALE",
  MISSING = "MISSING",
}

export enum AssetStatus {
  ACTIVE    = "ACTIVE",
  OPERATING = "OPERATING",
  DOWN      = "DOWN",
  UNKNOWN   = "UNKNOWN",
}

// ── Fleet Risk Tracker types ──────────────────────────────────────────────────

export interface TransitVehicle {
  readonly alias: string;
  readonly assetDescription: string;
  readonly unitsLate: number;
  readonly daysLate: number;
  readonly tolerance: number;
  readonly nextTrigger: number;
  readonly lastReading: number;
  readonly location: GarageLocation;
  readonly status: AssetStatus;
}

export interface RiskProfile {
  readonly score: number;
  readonly level: RiskLevel;
  readonly label: string;
}

export interface BusRiskDetails {
  readonly busNumber: string;
  readonly assetDescription: string;
  readonly assetType: AssetType;
  readonly isConventionalBus: boolean;
  readonly location: GarageLocation;
  readonly assetStatus: AssetStatus;
  readonly reportDate: Date | null;
  readonly odometerKm: number;
  readonly nextServiceKm: number;
  readonly kmToNextService: number;
  readonly unitsLate: number;
  readonly daysOverdue: number;
  readonly toleranceKm: number;
  readonly riskLevel: RiskLevel;
  readonly riskScore: number;
  readonly riskLabel: string;
  readonly riskRatio: number;
  readonly overToleranceByKm: number;
  readonly yearBuilt: number | null;
  readonly ageYears: number | null;
  readonly currentJobPlan: string;
  readonly nextJobPlan: string;
  readonly unitsLateDelta: number | null;
  readonly daysLateDelta: number | null;
  readonly dataFreshness: DataFreshness;
  readonly dataGaps: readonly string[];
  readonly riskFactors: readonly string[];
}

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
  readonly overduePercent: number;
}

export interface BusRiskReport {
  readonly assets: readonly BusRiskDetails[];
  readonly fleet: FleetRiskSummary;
  readonly depots: readonly DepotRiskSummary[];
}

export type RiskFilterValue = RiskLevel | "ALL";

export interface FilterState {
  readonly query: string;
  readonly riskLevel: RiskFilterValue;
}

export interface AppConfig {
  readonly csvPaths: CsvPaths;
  readonly asOfDate: Date;
}

export interface CsvPaths {
  readonly current: string;
  readonly previous: string;
}

// ── Parts Inventory / Bus Dashboard types ─────────────────────────────────────

export interface ServicePart {
  readonly partName: string;
  readonly partNumber: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly notes?: string;
  readonly serviceLevel: ServiceLevel[];
}

export interface BusServiceSpec {
  readonly manufacturer: BusManufacturer;
  readonly rangeLabel: string;
  readonly aliasMin: number;
  readonly aliasMax: number;
  readonly parts: ServicePart[];
  readonly notes?: string;
}

export interface PMRecord {
  readonly alias: string;
  readonly pmNum: string;
  readonly pmDescription: string;
  readonly jobPlanDescription: string;
  readonly currentJobPlan: string;
  readonly workOrderNum: string;
  readonly assetNum: string;
  readonly assetDescription: string;
  readonly location: GarageLocation;
  readonly pmStatus: string;
  readonly assetStatus: string;
  readonly odometerKm: number;
  readonly nextTriggerKm: number;
  readonly kmToNext: number;
  readonly frequency: number;
  readonly tolerance: number;
  readonly unitsLate: number;
  readonly daysLate: number;
  readonly lastPMReading: number;
  readonly reportDate: Date | null;
  readonly riskLevel: RiskLevel;
  readonly riskScore: number;
}

export interface BusRecord {
  readonly alias: string;
  readonly manufacturer: BusManufacturer;
  readonly rangeLabel: string;
  readonly assetDescription: string;
  readonly location: GarageLocation;
  readonly assetStatus: string;
  readonly pm: PMRecord;
  readonly serviceSpec: BusServiceSpec | null;
  readonly currentServiceLevel: ServiceLevel;
  readonly maintenanceHistory: MaintenanceEntry[];
  readonly riskLevel: RiskLevel;
  readonly riskScore: number;
}

export interface MaintenanceEntry {
  readonly id: string;
  readonly busAlias: string;
  readonly serviceLevel: ServiceLevel;
  readonly status: MaintenanceStatus;
  readonly performedBy: string;
  readonly garage: GarageLocation;
  readonly odometerAtService: number;
  readonly scheduledDate: Date;
  readonly completedDate: Date | null;
  readonly partsUsed: UsedPart[];
  readonly notes: string;
  readonly workOrderNum: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UsedPart {
  readonly partNumber: string;
  readonly partName: string;
  readonly quantityUsed: number;
  readonly unit: string;
}

export interface NewMaintenanceEntryForm {
  busAlias: string;
  serviceLevel: ServiceLevel | "";
  status: MaintenanceStatus;
  performedBy: string;
  garage: GarageLocation | "";
  odometerAtService: number | "";
  scheduledDate: string;
  completedDate: string;
  partsUsed: UsedPartForm[];
  notes: string;
  workOrderNum: string;
}

export interface UsedPartForm {
  partNumber: string;
  partName: string;
  quantityUsed: number | "";
  unit: string;
}

export type UpdateMaintenanceEntryForm = NewMaintenanceEntryForm & { id: string };

export interface DashboardFilters {
  search: string;
  riskLevel: RiskLevel | "ALL";
  location: GarageLocation | "ALL";
  serviceLevel: ServiceLevel | "ALL";
  status: MaintenanceStatus | "ALL";
}

export interface FleetSummary {
  total: number;
  critical: number;
  warning: number;
  stable: number;
  overdueCount: number;
  byGarage: Record<GarageLocation, number>;
}

export interface AutofillOverride {
  field: keyof NewMaintenanceEntryForm;
  previousValue: string;
  newValue: string;
}