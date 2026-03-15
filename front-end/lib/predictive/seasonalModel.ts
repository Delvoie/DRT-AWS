// lib/predictive/seasonalModel.ts
// ─────────────────────────────────────────────────────────────────────────────
// Canadian seasonal degradation multipliers for Durham Region Transit.
// Multiplier > 1.0 means the part degrades that % faster that month.
// 1.0 = baseline wear rate.
//
// Based on southern Ontario climate:
//   Winter (Dec–Feb): road salt, extreme cold, cold-start stress
//   Spring (Mar–May): melt-water residue, humidity cycling
//   Summer (Jun–Aug): heat soak, A/C load, DEF degradation
//   Fall   (Sep–Nov): temperature swings, early frost
// ─────────────────────────────────────────────────────────────────────────────

import type { PartCategory, Season } from "@/lib/types/predictive";

// Index 0 = January … Index 11 = December
export const SEASONAL_MULTIPLIERS: Record<PartCategory, number[]> = {
  //            J     F     M     A     M     J     J     A     S     O     N     D
  brake:      [1.50, 1.45, 1.30, 1.10, 1.00, 1.00, 1.00, 1.00, 1.00, 1.05, 1.20, 1.40],
  fluid:      [1.30, 1.30, 1.10, 1.00, 1.00, 1.20, 1.25, 1.20, 1.05, 1.00, 1.10, 1.25],
  filter:     [1.20, 1.20, 1.05, 1.00, 1.00, 1.10, 1.10, 1.10, 1.00, 1.00, 1.05, 1.15],
  hvac:       [1.60, 1.60, 1.20, 1.00, 1.00, 1.40, 1.50, 1.40, 1.00, 1.00, 1.20, 1.50],
  drivetrain: [1.20, 1.20, 1.05, 1.00, 1.00, 1.10, 1.10, 1.10, 1.00, 1.00, 1.05, 1.15],
  electrical: [1.15, 1.15, 1.00, 1.00, 1.00, 1.10, 1.15, 1.10, 1.00, 1.00, 1.05, 1.10],
};

/** Returns the seasonal multiplier for a given part category and date. */
export function getSeasonalMultiplier(
  category: PartCategory,
  date: Date = new Date()
): number {
  const month = date.getMonth(); // 0-indexed
  return SEASONAL_MULTIPLIERS[category]?.[month] ?? 1.0;
}

/** Returns the current Canadian season for a given date. */
export function currentSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1; // 1-indexed
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "fall";
}

/** Human-readable reason for the current seasonal multiplier. */
export function seasonalReason(category: PartCategory, date: Date = new Date()): string {
  const season = currentSeason(date);
  const mult   = getSeasonalMultiplier(category, date);
  const pct    = Math.round((mult - 1) * 100);

  if (pct === 0) return "Baseline wear — no seasonal adjustment";

  const reasons: Record<PartCategory, Record<Season, string>> = {
    brake:      {
      winter: `Road salt and brine exposure accelerates brake wear +${pct}%`,
      spring: `Residual salt and potholes elevate brake stress +${pct}%`,
      summer: "Baseline brake wear — no seasonal adjustment",
      fall:   `Early frost and temperature cycling +${pct}%`,
    },
    fluid:      {
      winter: `Cold-start viscosity stress and thermal cycling +${pct}%`,
      spring: "Baseline fluid wear",
      summer: `Heat soak accelerates fluid oxidation +${pct}%`,
      fall:   "Baseline fluid wear",
    },
    filter:     {
      winter: `Salt particulates and road grit clog filters faster +${pct}%`,
      spring: "Baseline filter wear",
      summer: `Increased dust and heat degrade filter media +${pct}%`,
      fall:   "Baseline filter wear",
    },
    hvac:       {
      winter: `Webasto heater and defroster running constantly +${pct}%`,
      spring: "Baseline HVAC wear",
      summer: `A/C compressor at peak load +${pct}%`,
      fall:   "Baseline HVAC wear",
    },
    drivetrain: {
      winter: `Cold-start transmission stress and salt exposure +${pct}%`,
      spring: "Baseline drivetrain wear",
      summer: `Heat-soak of transmission fluid +${pct}%`,
      fall:   "Baseline drivetrain wear",
    },
    electrical: {
      winter: `Cold reduces battery/starter capacity and increases draw +${pct}%`,
      spring: "Baseline electrical wear",
      summer: `Heat degrades wiring insulation and connectors +${pct}%`,
      fall:   "Baseline electrical wear",
    },
  };

  return reasons[category]?.[season] ?? `Seasonal adjustment +${pct}%`;
}
