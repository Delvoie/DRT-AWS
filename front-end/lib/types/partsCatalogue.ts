// lib/partsCatalogue.ts
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
} from "@/lib/types";

// ── Helper ────────────────────────────────────────────────────────────────────

function part(
  partName: string,
  partNumber: string,
  levels: ServiceLevel[],
  opts?: { quantity?: number; unit?: string; notes?: string }
): ServicePart {
  return { partName, partNumber, serviceLevel: levels, ...opts };
}

// Cumulative level arrays — matches PDF column headers exactly
const A    = [ServiceLevel.A];
const AB   = [ServiceLevel.A, ServiceLevel.B];
const ABC  = [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C];
const ABCD = [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C, ServiceLevel.D];

// ── Catalogue ─────────────────────────────────────────────────────────────────

export const BUS_SERVICE_SPECS: BusServiceSpec[] = [

  // ── New Flyer 0107-0115 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "0107-0115",
    aliasMin: 107,
    aliasMax: 115,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "LAF2100",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "275163",       ABC),
      part("Barium Grease",          "3964093",      ABC),
      part("Hydraulic Filter",       "6313239",      ABC),
      part("Crankcase Filter",       "59.3355.10",   ABC),
      part("Dryer Cartridge",        "N/A",          ABCD),
      part("Transmission Filter",    "N/A",          ABCD),
      part("Trans Fld. Capacity",    "22 litres",    ABCD, { quantity: 22,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
    ],
  },

  // ── New Flyer 8419-8430 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8419-8430",
    aliasMin: 8419,
    aliasMax: 8430,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",    A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "LAF2100",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "275163",       ABC),
      part("Barium Grease",          "3964093",      ABC),
      part("Hydraulic Filter",       "6313239",      ABC),
      part("Crankcase Filter",       "59.3355.10",   ABC),
      part("Dryer Cartridge",        "N/A",          ABCD),
      part("Transmission Filter",    "N/A",          ABCD),
      part("Trans Fld. Capacity",    "22 litres",    ABCD, { quantity: 22,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Webasto A/F",            "P550637",      ABCD, { notes: "with EMP" }),
      part("Webasto A/F Secondary",  "225334",       ABCD, { notes: "with EMP" }),
    ],
  },

  // ── New Flyer 8431-8473 ───────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8431-8473",
    aliasMin: 8431,
    aliasMax: 8473,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "LAF2100",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "275163",       ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "6313239",      ABCD),
      part("Transmission Filter",    "151.000.88710", ABCD),
      part("Trans Fld. Capacity",    "25 litres",    ABCD, { quantity: 25,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
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
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "6389969",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Secondary Air Filter",   "477007",       A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "6334006",      ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "47178964",     ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "151.000.88710-Voith", ABCD),
      part("Trans Fld. Capacity",    "25 litres",    ABCD, { quantity: 25,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Xcelsior 8519-8522 (Allison) ─────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8519-8522 (Xcelsior Allison)",
    aliasMin: 8519,
    aliasMax: 8522,
    notes: "Allison transmission. Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",      "LFP3000XL",    A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "6389969",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Secondary Air Filter",   "477007",       A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "6334006",      ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "47178964",     ABCD, { quantity: 2,    notes: "x2" }),
      part("Internal Trans. Filter", "25940493",     ABCD, { notes: "Allison" }),
      part("Transmission Filter",    "29544785",     ABCD, { notes: "Allison" }),
      part("Trans Fld. Capacity",    "28 litres",    ABCD, { quantity: 28,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Xcelsior 8536-8543 ────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8536-8543 (Xcelsior)",
    aliasMin: 8536,
    aliasMax: 8543,
    notes: "Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "6389969",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Secondary Air Filter",   "477007",       A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "6334006",      ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "47178964",     ABCD, { quantity: 2,    notes: "x2" }),
      part("Internal Trans. Filter", "25940493",     ABCD, { notes: "Allison" }),
      part("Transmission Filter",    "29544785",     ABCD, { notes: "Allison" }),
      part("Trans Fld. Capacity",    "28 litres",    ABCD, { quantity: 28,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Xcelsior 8544-8547 ────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8544-8547 (Xcelsior)",
    aliasMin: 8544,
    aliasMax: 8547,
    notes: "Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "6389969",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Secondary Air Filter",   "477007",       A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "6334006",      ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "47178964",     ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "151.000.88710-Voith", ABCD),
      part("Trans Fld. Capacity",    "25 litres",    ABCD, { quantity: 25,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Xcelsior 8601-8626 ────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.NewFlyer,
    rangeLabel: "8601-8626 (Xcelsior)",
    aliasMin: 8601,
    aliasMax: 8626,
    notes: "Secondary Air Filter: 477007",
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25,   unit: "litres" }),
      part("Air Filter",             "6389969",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Secondary Air Filter",   "477007",       A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF5636FLG",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "6334006",      ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "47178964",     ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "151.000.88710-Voith", ABCD),
      part("Trans Fld. Capacity",    "25 litres",    ABCD, { quantity: 25,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Nova 8551-8589 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "8551-8589",
    aliasMin: 8551,
    aliasMax: 8589,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
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
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
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
      part("Oil Filter - West",      "3937736",      A),
      part("Engine Oil",             "15W40",        A,    { quantity: 19.7, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS20121NN",    AB),
      part("2nd Fuel Filter",        "FF63041NN",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "LF3338",       ABCD),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "19401695",     ABCD),
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
      part("Transmission Filter",    "LF3338",       ABCD),
    ],
  },

  // ── Nova 7100-7103 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "7100-7103",
    aliasMin: 7100,
    aliasMax: 7103,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Nova 7104-7124 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "7104-7124",
    aliasMin: 7104,
    aliasMax: 7124,
    parts: [
      part("Oil Filter - West",      "LFP3000XL",   A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS20121NN",    AB),
      part("2nd Fuel Filter",        "FF63041NN",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "19401695",     ABCD),
    ],
  },

  // ── Nova 9100-9105 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "9100-9105",
    aliasMin: 9100,
    aliasMax: 9105,
    parts: [
      part("Oil Filter - West",      "N/A",          A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS1065FLG",    AB),
      part("2nd Fuel Filter",        "FF63008",      AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
    ],
  },

  // ── Nova 9106-9107 ────────────────────────────────────────────────────────
  {
    manufacturer: BusManufacturer.Nova,
    rangeLabel: "9106-9107",
    aliasMin: 9106,
    aliasMax: 9107,
    parts: [
      part("Oil Filter - West",      "N/A",          A),
      part("Engine Oil",             "15W40",        A,    { quantity: 25.6, unit: "litres" }),
      part("Air Filter",             "LAF1878",      A),
      part("Spinner Cartridge",      "6359175",      A),
      part("Fuel Filter",            "FS20121NN",    AB),
      part("2nd Fuel Filter",        "FF63041NN",    AB),
      part("Cool. Filter West",      "LFW4074",      AB),
      part("Brake Tr. Clip",         "6351580",      ABC),
      part("Barium Grease",          "246671",       ABC),
      part("Hydraulic Filter",       "N8900761",     ABC),
      part("Crankcase Filter",       "CV50603",      ABC),
      part("Dryer Cartridge",        "471-78964",    ABCD, { quantity: 2,    notes: "x2" }),
      part("Transmission Filter",    "0501.216.503", ABCD),
      part("Trans Fld. Capacity",    "24 litres",    ABCD, { quantity: 24,   unit: "litres" }),
      part("Wabasto Cartridge",      "50900001A",    ABCD),
      part("Def. Filter",            "6392223",      ABCD),
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

/**
 * Returns all parts required for a given service level (cumulative).
 * A = A only | B = A+B | C = A+B+C | D = A+B+C+D
 */
export function getPartsForServiceLevel(
  spec: BusServiceSpec,
  level: ServiceLevel
): ServicePart[] {
  // Explicit map — avoids broken string >= comparisons on enum values
  const included: Record<ServiceLevel, ServiceLevel[]> = {
    [ServiceLevel.A]: [ServiceLevel.A],
    [ServiceLevel.B]: [ServiceLevel.A, ServiceLevel.B],
    [ServiceLevel.C]: [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C],
    [ServiceLevel.D]: [ServiceLevel.A, ServiceLevel.B, ServiceLevel.C, ServiceLevel.D],
  };
  const levels = included[level];

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

/** All unique garages. */
export const ALL_GARAGES = Object.values(GarageLocation);
