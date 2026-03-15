// src/lib/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Unified barrel export for the DRT Fleet System.
// Import from "@/lib" to access anything from either sub-system.
// ─────────────────────────────────────────────────────────────────────────────

// ── All types ────────────────────────────────────────────────────────────────
export type {
  AppConfig,
  AutofillOverride,
  BusRecord,
  BusRiskDetails,
  BusRiskReport,
  BusServiceSpec,
  CsvPaths,
  DashboardFilters,
  DepotRiskSummary,
  FilterState,
  FleetRiskSummary,
  FleetSummary,
  MaintenanceCsvRow,
  MaintenanceEntry,
  NewMaintenanceEntryForm,
  PMRecord,
  RiskFilterValue,
  RiskProfile,
  ServicePart,
  TransitVehicle,
  UpdateMaintenanceEntryForm,
  UsedPart,
  UsedPartForm,
} from "../types";

export {
  AssetStatus,
  AssetType,
  BusManufacturer,
  DataFreshness,
  GarageLocation,
  MaintenanceStatus,
  RiskLevel,
  ServiceLevel,
} from "../types";

// ── CSV utilities ─────────────────────────────────────────────────────────────
export {
  parseCsv,
  parseCsvLine,
  isMaximoTypeRow,
  isTypeRow,
  latestRowByAlias,
  deduplicateByAlias,
  rowToPMRecord,
  csvToPMRecords,
  toNumber,
  toNum,
  safeParseDate,
  toDate,
} from "../csv";

// ── Risk engine ───────────────────────────────────────────────────────────────
export {
  buildBusRiskReport,
  calculateVehicleRisk,
  classifyDataFreshness,
  extractYear,
  isConventionalBus,
  normalizeLocation,
  normalizeStatus,
} from "../risk";

// ── Export utility (fleet risk tracker) ──────────────────────────────────────
export { exportReport, reportToCsv, downloadCsv } from "./export";

// ── Parts catalogue (bus dashboard) ──────────────────────────────────────────
export {
  BUS_SERVICE_SPECS,
  getSpecForAlias,
  getPartsForServiceLevel,
  serviceLevelFromJobPlan,
  ALL_GARAGES,
} from "../partsCatalogue";

// ── Mock data (bus dashboard) ─────────────────────────────────────────────────
export {
  generateMockBusRecords,
  getMockBuses,
  computeFleetSummary,
} from "../mockData";

export type {
  PartCategory, PartHealthRecord, PartTag, PartTagKey,
  PredictiveFleetSummary, PredictiveNotification,
  NotificationPriority, Season, TagColour,
} from "./predictive";