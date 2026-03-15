// lib/types/predictive.ts
// ─────────────────────────────────────────────────────────────────────────────
// All types for the Predictive Parts Tagging System (PPTS).
// Additive — no existing types are modified.
// ─────────────────────────────────────────────────────────────────────────────

// ── Part category ─────────────────────────────────────────────────────────────

export type PartCategory =
  | "brake"
  | "filter"
  | "fluid"
  | "hvac"
  | "drivetrain"
  | "electrical";

// ── Season ────────────────────────────────────────────────────────────────────

export type Season = "winter" | "spring" | "summer" | "fall";

// ── Tag keys ──────────────────────────────────────────────────────────────────

export type PartTagKey =
  | "seasonal_risk"
  | "winter_stress"
  | "summer_heat"
  | "wear_accelerated"
  | "mileage_due"
  | "overdue_service"
  | "failure_risk"
  | "order_now"
  | "order_soon"
  | "historically_bad"
  | "new_install"
  | "data_gap";

export type TagColour =
  | "red"
  | "amber"
  | "teal"
  | "blue"
  | "green"
  | "purple"
  | "gray";

export interface PartTag {
  key:    PartTagKey;
  label:  string;
  colour: TagColour;
  urgent: boolean;
  reason: string; // human-readable justification
}

// ── Core health record ────────────────────────────────────────────────────────

export interface PartHealthRecord {
  busAlias:           string;
  partName:           string;
  partNumber:         string;
  partCategory:       PartCategory;
  healthPct:          number;       // 0–100
  tags:               PartTag[];
  odometerKm:         number;
  lastReplacedKm:     number;
  expectedLifeKm:     number;
  expectedLifeDays:   number;
  daysInService:      number;
  seasonalMultiplier: number;
  projectedFailureKm: number | null;
  projectedFailureDate: Date | null;
  orderByDate:        Date | null;
  snapshotDate:       Date;
}

// ── Fleet-level predictive summary ───────────────────────────────────────────

export interface PredictiveFleetSummary {
  totalParts:       number;
  criticalCount:    number;   // health ≤ 20
  orderNowCount:    number;   // order_now tag
  orderSoonCount:   number;   // order_soon tag
  seasonalRiskCount: number;  // seasonal_risk tag
  avgFleetHealth:   number;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface PredictiveNotification {
  id:                 string;
  busAlias:           string;
  partName:           string;
  partNumber:         string;
  priority:           NotificationPriority;
  title:              string;
  body:               string;   // human-readable justification
  healthPct:          number;
  tags:               PartTagKey[];
  orderByDate:        Date | null;
  projectedFailureKm: number | null;
  urgencyScore:       number;   // 0–100 for sorting
  snoozedUntil:       Date | null;
  dismissed:          boolean;
  createdAt:          Date;
}
