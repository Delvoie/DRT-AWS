// ─────────────────────────────────────────────────────────────────────────────
// index.ts — DRT Fleet Risk Tracker
// Public API surface. Import from here when using as a library.
// ─────────────────────────────────────────────────────────────────────────────

// Types
export type {
  AppConfig,
  BusRiskDetails,
  BusRiskReport,
  CsvPaths,
  DepotRiskSummary,
  FilterState,
  FleetRiskSummary,
  MaintenanceCsvRow,
  RiskFilterValue,
  RiskProfile,
  TransitVehicle,
} from "./types.js";

export {
  AssetStatus,
  AssetType,
  DataFreshness,
  GarageLocation,
  RiskLevel,
} from "./types.js";

// CSV utilities
export {
  isMaximoTypeRow,
  latestRowByAlias,
  parseCsv,
  parseCsvLine,
  safeParseDate,
  toNumber,
} from "./csv.js";

// Risk engine
export {
  buildBusRiskReport,
  calculateVehicleRisk,
  classifyDataFreshness,
  extractYear,
  isConventionalBus,
  normalizeLocation,
  normalizeStatus,
} from "./risk.js";

// UI helpers (available for embedding in other pages)
export {
  bindFilterControls,
  filterAssets,
  readFilterState,
  renderRiskRows,
  renderStatus,
  renderSummaryCards,
} from "./ui.js";
