// src/lib/mockData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Realistic mock data generators for the DRT Bus Maintenance Dashboard.
// Generates: PMRecords, MaintenanceEntries, and full BusRecords.
// Uses the actual bus ranges and part numbers from the PDF catalogue.
// ─────────────────────────────────────────────────────────────────────────────

import { nanoid } from "nanoid";
import {
  BusManufacturer,
  GarageLocation,
  MaintenanceStatus,
  RiskLevel,
  ServiceLevel,
  type BusRecord,
  type MaintenanceEntry,
  type PMRecord,
  type UsedPart,
} from "./types";

import {
  BUS_SERVICE_SPECS,
  getPartsForServiceLevel,
  getSpecForAlias,
  serviceLevelFromJobPlan,
} from "./partsCatalogue";

// ── Utilities ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date("2026-03-14T00:00:00");
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date("2026-03-14T00:00:00");
  d.setDate(d.getDate() + n);
  return d;
}

const TECHNICIANS = [
  "J. Morrison", "A. Patel", "R. Singh", "D. Chen",
  "M. Williams", "S. Kowalski", "T. Brown", "F. Osei",
];

const NOTE_TEMPLATES = [
  "Completed per work order. All parts replaced as specified.",
  "Oil change and filter replacement performed. No anomalies noted.",
  "Service completed. Air filter showed heavy fouling — noted for early re-inspection.",
  "Transmission filter replacement — fluid was dark, advised monitoring.",
  "Routine service. Brake clips showed minor wear but within tolerance.",
  "Completed full D service. Dryer cartridge was saturated.",
  "All items serviced. Webasto heater core inspected — operational.",
  "Service completed. Coolant system flushed and refilled to spec.",
];

// ── PM Record generator ───────────────────────────────────────────────────────

const ALIAS_RANGES: { aliases: string[]; location: GarageLocation; manufacturer: BusManufacturer }[] = [
  { aliases: ["0107","0108","0109","0110","0111","0112","0113","0114","0115"], location: GarageLocation.Westney, manufacturer: BusManufacturer.NewFlyer },
  { aliases: ["8419","8422","8425","8430"], location: GarageLocation.Raleigh, manufacturer: BusManufacturer.NewFlyer },
  { aliases: ["8431","8445","8460","8473"], location: GarageLocation.Raleigh, manufacturer: BusManufacturer.NewFlyer },
  { aliases: ["8501","8507","8515","8522","8533"], location: GarageLocation.Raleigh, manufacturer: BusManufacturer.NewFlyer },
  { aliases: ["8551","8560","8566","8575","8589"], location: GarageLocation.Westney, manufacturer: BusManufacturer.Nova },
  { aliases: ["8601","8608","8615","8620","8626"], location: GarageLocation.Raleigh, manufacturer: BusManufacturer.NewFlyer },
  { aliases: ["6100","6105","6110","6115","6119"], location: GarageLocation.Westney, manufacturer: BusManufacturer.Nova },
  { aliases: ["6120","6125","6129"], location: GarageLocation.Westney, manufacturer: BusManufacturer.Nova },
  { aliases: ["7100","7104","7110","7115","7120","7124"], location: GarageLocation.Raleigh, manufacturer: BusManufacturer.Nova },
];

const SERVICE_DESCRIPTIONS = [
  "CONVENTIONAL NEW FLYER - A SERVICE",
  "CONVENTIONAL NEW FLYER - B SERVICE",
  "CONVENTIONAL NEW FLYER - C SERVICE",
  "CONVENTIONAL NEW FLYER - D SERVICE",
  "CONVENTIONAL NOVA - A SERVICE",
  "CONVENTIONAL NOVA - B SERVICE",
  "CONVENTIONAL NOVA - D SERVICE",
];

function generatePMRecord(alias: string, location: GarageLocation, manufacturer: BusManufacturer, index: number): PMRecord {
  const daysLate = pick([0, 0, 0, 3, 8, 14, 22]);
  const unitsLate = daysLate * rand(50, 90);
  const tolerance = 1000;
  const odometer = rand(400_000, 1_200_000);
  const frequency = 10_000;
  const kmToNext = rand(-500, frequency);
  const curJP = pick(SERVICE_DESCRIPTIONS);
  const scheduledJP = SERVICE_DESCRIPTIONS[index % SERVICE_DESCRIPTIONS.length] as string;

  let riskLevel: RiskLevel;
  let riskScore: number;
  if (unitsLate > tolerance || daysLate > 14) { riskLevel = RiskLevel.Critical; riskScore = Math.max(unitsLate, daysLate * 71); }
  else if (unitsLate > tolerance * 0.5 || daysLate > 7) { riskLevel = RiskLevel.Warning; riskScore = unitsLate; }
  else { riskLevel = RiskLevel.Stable; riskScore = unitsLate; }

  const yearMap: Record<BusManufacturer, string> = {
    [BusManufacturer.NewFlyer]: `${rand(2010, 2020)} - CONVENTIONAL NEW FLYER - ${alias}`,
    [BusManufacturer.Nova]:     `${rand(2015, 2022)} - CONVENTIONAL NOVA - ${alias}`,
    [BusManufacturer.Admin]:    `${rand(2018, 2022)} - ADMIN VEHICLE - ${alias}`,
    [BusManufacturer.Unknown]:  `UNKNOWN - ${alias}`,
  };

  return {
    alias,
    pmNum:              `PM${rand(30000, 99999)}`,
    pmDescription:      `${alias} - SERVICE INSPECTION`,
    jobPlanDescription: scheduledJP,
    currentJobPlan:     curJP,
    workOrderNum:       `T${rand(1000000, 9999999)}`,
    assetNum:           `${rand(1000000, 9999999)}`,
    assetDescription:   yearMap[manufacturer],
    location,
    pmStatus:           "ACTIVE",
    assetStatus:        pick(["OPERATING", "OPERATING", "OPERATING", "DOWN"]),
    odometerKm:         odometer,
    nextTriggerKm:      odometer + kmToNext,
    kmToNext,
    frequency,
    tolerance,
    unitsLate,
    daysLate,
    lastPMReading:      odometer - rand(8000, 12000),
    reportDate:         daysAgo(rand(0, 30)),
    riskLevel,
    riskScore,
  };
}

// ── Maintenance history generator ─────────────────────────────────────────────

function generateMaintenanceEntry(
  busAlias: string,
  location: GarageLocation,
  serviceLevel: ServiceLevel,
  offsetDays: number,
  odometer: number,
  status?: MaintenanceStatus
): MaintenanceEntry {
  const spec = getSpecForAlias(busAlias);
  const parts = spec ? getPartsForServiceLevel(spec, serviceLevel) : [];
  const usedParts: UsedPart[] = parts.slice(0, rand(2, Math.min(parts.length, 8))).map(p => ({
    partNumber:    p.partNumber,
    partName:      p.partName,
    quantityUsed:  p.quantity ?? 1,
    unit:          p.unit ?? "each",
  }));

  const scheduledDate = daysAgo(offsetDays);
  const isComplete = status === MaintenanceStatus.Complete || (!status && offsetDays > 5);
  const completedDate = isComplete ? new Date(scheduledDate.getTime() + rand(0, 3) * 86_400_000) : null;

  const resolvedStatus = status ??
    (offsetDays < 0 ? MaintenanceStatus.Pending :
     offsetDays > 14 && !completedDate ? MaintenanceStatus.Overdue :
     isComplete ? MaintenanceStatus.Complete : MaintenanceStatus.InProgress);

  return {
    id:                 nanoid(),
    busAlias,
    serviceLevel,
    status:             resolvedStatus,
    performedBy:        pick(TECHNICIANS),
    garage:             location,
    odometerAtService:  odometer - offsetDays * rand(100, 200),
    scheduledDate,
    completedDate,
    partsUsed:          usedParts,
    notes:              pick(NOTE_TEMPLATES),
    workOrderNum:       `T${rand(1000000, 9999999)}`,
    createdAt:          daysAgo(offsetDays + rand(1, 5)),
    updatedAt:          daysAgo(rand(0, offsetDays)),
  };
}

function generateHistoryForBus(pm: PMRecord): MaintenanceEntry[] {
  const levels = [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C, ServiceLevel.D];
  const entries: MaintenanceEntry[] = [];

  // 6-18 historical entries going back ~2 years
  const count = rand(6, 18);
  for (let i = 0; i < count; i++) {
    const daysBack = rand(10, 730);
    const level = pick(levels);
    const status = daysBack > 5 ? MaintenanceStatus.Complete : pick([MaintenanceStatus.InProgress, MaintenanceStatus.Pending]);
    entries.push(generateMaintenanceEntry(pm.alias, pm.location, level, daysBack, pm.odometerKm, status));
  }

  // Add one upcoming / in-progress entry
  entries.push(generateMaintenanceEntry(
    pm.alias, pm.location,
    serviceLevelFromJobPlan(pm.currentJobPlan),
    rand(-3, 3), pm.odometerKm,
    pm.riskLevel === RiskLevel.Critical ? MaintenanceStatus.Overdue : MaintenanceStatus.Pending
  ));

  return entries.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
}

// ── Full BusRecord generator ──────────────────────────────────────────────────

export function generateMockBusRecords(): BusRecord[] {
  const records: BusRecord[] = [];
  let globalIndex = 0;

  for (const range of ALIAS_RANGES) {
    for (const alias of range.aliases) {
      const pm = generatePMRecord(alias, range.location, range.manufacturer, globalIndex++);
      const spec = getSpecForAlias(alias);
      const currentServiceLevel = serviceLevelFromJobPlan(pm.currentJobPlan);
      const history = generateHistoryForBus(pm);

      records.push({
        alias,
        manufacturer:         range.manufacturer,
        rangeLabel:           spec?.rangeLabel ?? alias,
        assetDescription:     pm.assetDescription,
        location:             range.location,
        assetStatus:          pm.assetStatus,
        pm,
        serviceSpec:          spec,
        currentServiceLevel,
        maintenanceHistory:   history,
        riskLevel:            pm.riskLevel,
        riskScore:            pm.riskScore,
      });
    }
  }

  return records;
}

// ── Fleet summary ─────────────────────────────────────────────────────────────

export function computeFleetSummary(buses: BusRecord[]) {
  return {
    total:        buses.length,
    critical:     buses.filter(b => b.riskLevel === RiskLevel.Critical).length,
    warning:      buses.filter(b => b.riskLevel === RiskLevel.Warning).length,
    stable:       buses.filter(b => b.riskLevel === RiskLevel.Stable).length,
    overdueCount: buses.filter(b => b.pm.unitsLate > b.pm.tolerance).length,
    byGarage: {
      [GarageLocation.Raleigh]: buses.filter(b => b.location === GarageLocation.Raleigh).length,
      [GarageLocation.Westney]: buses.filter(b => b.location === GarageLocation.Westney).length,
      [GarageLocation.Unknown]: buses.filter(b => b.location === GarageLocation.Unknown).length,
    },
  };
}

// ── Stable seed (deterministic for demos) ────────────────────────────────────
// Call this once at app startup to get a stable set of buses.
let _cache: BusRecord[] | null = null;
if (process.env.NODE_ENV === "development") _cache = null;
export function getMockBuses(): BusRecord[] {
  if (!_cache) _cache = generateMockBusRecords();
  return _cache;
}
