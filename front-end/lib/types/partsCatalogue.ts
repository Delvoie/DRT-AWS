// src/lib/partsCatalogue.ts
// ─────────────────────────────────────────────────────────────────────────────
// Complete parts catalogue transcribed from the PDF:
// "NEW_PM_Service - Fluid and Filter Requirements June 19, 2025"
//
// Each BusServiceSpec covers a bus number range and lists every part
// required per service level (A, B, C, D). Levels are cumulative:
//   B includes A | C includes A+B | D includes A+B+C
// ─────────────────────────────────────────────────────────────────────────────

import {
  BusManufacturer,
  GarageLocation,
  ServiceLevel,
  type BusServiceSpec,
  type ServicePart,
} from "../types";

// ── Helper ────────────────────────────────────────────────────────────────────

function part(
  partName: string,
  partNumber: string,
  levels: ServiceLevel[],
  opts?: { quantity?: number; unit?: string; notes?: string }
): ServicePart {
  return { partName, partNumber, serviceLevel: levels, ...opts };
}

const ALL_LEVELS = [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C, ServiceLevel.D];
const BCD = [ServiceLevel.B, ServiceLevel.C, ServiceLevel.D];
const CD  = [ServiceLevel.C, ServiceLevel.D];
const D   = [ServiceLevel.D];

// ── Catalogue ─────────────────────────────────────────────────────────────────

export const BUS_SERVICE_SPECS: BusServiceSpec[] = [
  // ── New Flyer 0107-0115 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "0107-0115",
    aliasMin: 107,
    aliasMax: 115,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25, unit: "litres" }),
      part("Air Filter",               "LAF2100",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF5636FLG",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "275163",       CD),
      part("Barium Grease",            "3964093",      CD),
      part("Hydraulic Filter",         "6313239",      CD),
      part("Crankcase Filter",         "59.3355.10",   CD),
      part("Dryer Cartridge",          "N/A",          D),
      part("Transmission Filter",      "N/A",          D),
      part("Trans Fld. Capacity",      "22 litres",    D, { quantity: 22, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
    ],
  },

  // ── New Flyer 8419-8430 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8419-8430",
    aliasMin: 8419,
    aliasMax: 8430,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25, unit: "litres" }),
      part("Air Filter",               "LAF2100",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF5636FLG",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "275163",       CD),
      part("Barium Grease",            "3964093",      CD),
      part("Hydraulic Filter",         "6313239",      CD),
      part("Crankcase Filter",         "59.3355.10",   CD),
      part("Dryer Cartridge",          "N/A",          D),
      part("Transmission Filter",      "N/A",          D),
      part("Trans Fld. Capacity",      "22 litres",    D, { quantity: 22, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Webasto A/F",              "P550637",      D, { notes: "with EMP" }),
      part("Webasto A/F Secondary",    "225334",       D, { notes: "with EMP" }),
    ],
  },

  // ── New Flyer 8431-8473 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8431-8473",
    aliasMin: 8431,
    aliasMax: 8473,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25, unit: "litres" }),
      part("Air Filter",               "LAF2100",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF5636FLG",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "275163",       CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "6313239",      D),
      part("Transmission Filter",      "151.000.88710", D),
      part("Trans Fld. Capacity",      "25 litres",    D, { quantity: 25, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
    ],
  },

  // ── Xcelsior 8501-8533 ────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8501-8533 (Xcelsior)",
    aliasMin: 8501,
    aliasMax: 8533,
    notes: "Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25, unit: "litres" }),
      part("Air Filter",               "6389969",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF5636FLG",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "6334006",      CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "47178964",     D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "151.000.88710-Voith", D),
      part("Trans Fld. Capacity",      "25 litres",    D, { quantity: 25, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "6392223",      D),
      part("Secondary Air Filter",     "477007",       ALL_LEVELS),
    ],
  },

  // ── Xcelsior 8519-8522 (Allison trans) ────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8519-8522 (Xcelsior Allison)",
    aliasMin: 8519,
    aliasMax: 8522,
    notes: "Allison transmission. Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25, unit: "litres" }),
      part("Air Filter",               "6389969",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF5636FLG",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "6334006",      CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "47178964",     D, { quantity: 2, notes: "x2" }),
      part("Internal Trans. Filter",   "25940493",     D, { notes: "Allison" }),
      part("Transmission Filter",      "29544785",     D, { notes: "Allison" }),
      part("Trans Fld. Capacity",      "28 litres",    D, { quantity: 28, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "6392223",      D),
      part("Secondary Air Filter",     "477007",       ALL_LEVELS),
    ],
  },

  // ── Nova 8551-8589 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "8551-8589",
    aliasMin: 8551,
    aliasMax: 8589,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25.6, unit: "litres" }),
      part("Air Filter",               "LAF1878",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF63008",      BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "N8900761",     CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "471-78964",    D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "0501.216.503", D),
      part("Trans Fld. Capacity",      "24 litres",    D, { quantity: 24, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "6392223",      D),
    ],
  },

  // ── Nova 6100-6119 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "6100-6119",
    aliasMin: 6100,
    aliasMax: 6119,
    notes: "BAE TRACTION MOTOR",
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25.6, unit: "litres" }),
      part("Air Filter",               "LAF1878",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF63008",      BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "N8900761",     CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "471-78964",    D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "0501.216.503", D),
      part("Trans Fld. Capacity",      "24 litres",    D, { quantity: 24, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "6392223",      D),
    ],
  },

  // ── Nova HEV Hybrid 6120-6129 ─────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "6120-6129 (HEV Hybrid)",
    aliasMin: 6120,
    aliasMax: 6129,
    notes: "BAE TRACTION MOTOR. No crankcase filter.",
    parts: [
      part("Oil Filter - West",        "3937736",     ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 19.7, unit: "litres" }),
      part("Air Filter",               "LAF1878",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS20121NN",    BCD),
      part("2nd Fuel Filter",          "FF63041NN",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "N8900761",     CD),
      part("Dryer Cartridge",          "471-78964",    D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "LF3338",       D),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "19401695",     D),
    ],
  },

  // ── Nova LFSe BEB 6130-6135 ───────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "6130-6135 (LFSe BEB)",
    aliasMin: 6130,
    aliasMax: 6135,
    notes: "Battery Electric Bus — most fluids N/R (not required).",
    parts: [
      part("Transmission Filter",      "LF3338",       D),
    ],
  },

  // ── Nova 7100-7103 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "7100-7103",
    aliasMin: 7100,
    aliasMax: 7103,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25.6, unit: "litres" }),
      part("Air Filter",               "LAF1878",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS1065FLG",    BCD),
      part("2nd Fuel Filter",          "FF63008",      BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "N8900761",     CD),
      part("Crankcase Filter",         "CV50603",      CD),
      part("Dryer Cartridge",          "471-78964",    D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "0501.216.503", D),
      part("Trans Fld. Capacity",      "24 litres",    D, { quantity: 24, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "6392223",      D),
    ],
  },

  // ── Nova 7104-7124 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "7104-7124",
    aliasMin: 7104,
    aliasMax: 7124,
    parts: [
      part("Oil Filter - West",        "LFP3000XL",   ALL_LEVELS),
      part("Engine Oil",               "15W40",        ALL_LEVELS, { quantity: 25.6, unit: "litres" }),
      part("Air Filter",               "LAF1878",      ALL_LEVELS),
      part("Spinner Cartridge",        "6359175",      ALL_LEVELS),
      part("Fuel Filter",              "FS20121NN",    BCD),
      part("2nd Fuel Filter",          "FF63041NN",    BCD),
      part("Cool. Filter West",        "LFW4074",      BCD),
      part("Brake Tr. Clip",           "6351580",      CD),
      part("Barium Grease",            "246671",       CD),
      part("Hydraulic Filter",         "N8900761",     CD),
      part("Dryer Cartridge",          "471-78964",    D, { quantity: 2, notes: "x2" }),
      part("Transmission Filter",      "0501.216.503", D),
      part("Trans Fld. Capacity",      "24 litres",    D, { quantity: 24, unit: "litres" }),
      part("Wabasto Cartridge",        "50900001A",    D),
      part("Def. Filter",              "19401695",     D),
    ],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

/** Returns the service spec for a given bus alias number, or null if not found. */
export function getSpecForAlias(alias: string): BusServiceSpec | null {
  const num = parseInt(alias.replace(/\D/g, ""), 10);
  if (isNaN(num)) return null;

  // Prefer the most specific (smallest) range that contains the alias
  const matches = BUS_SERVICE_SPECS.filter(
    (s) => num >= s.aliasMin && num <= s.aliasMax
  );
  if (matches.length === 0) return null;

  return matches.reduce((best, s) =>
    s.aliasMax - s.aliasMin < best.aliasMax - best.aliasMin ? s : best
  );
}

/** Returns all parts required for a given service level (cumulative). */
export function getPartsForServiceLevel(
  spec: BusServiceSpec,
  level: ServiceLevel
): ServicePart[] {
  const levels: ServiceLevel[] = [];
  if (level >= ServiceLevel.A) levels.push(ServiceLevel.A);
  if (level >= ServiceLevel.B) levels.push(ServiceLevel.B);
  if (level >= ServiceLevel.C) levels.push(ServiceLevel.C);
  if (level >= ServiceLevel.D) levels.push(ServiceLevel.D);

  return spec.parts.filter((p) =>
    p.serviceLevel.some((sl) => levels.includes(sl))
  );
}

/** Derives the service level letter from a job plan description string. */
export function serviceLevelFromJobPlan(jobPlan: string): ServiceLevel {
  const upper = jobPlan.toUpperCase();
  if (upper.includes("D SERVICE")) return ServiceLevel.D;
  if (upper.includes("C SERVICE")) return ServiceLevel.C;
  if (upper.includes("B SERVICE")) return ServiceLevel.B;
  return ServiceLevel.A;
}

/** All unique garages across specs. */
export const ALL_GARAGES = Object.values(GarageLocation);
