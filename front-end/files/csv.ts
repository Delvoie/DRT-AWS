// ─────────────────────────────────────────────────────────────────────────────
// csv.ts — DRT Fleet Risk Tracker
// CSV parsing: handles quoted fields, the Maximo type-hint row, and produces
// a typed Map<alias, MaintenanceCsvRow> keyed on the most recent report date.
// ─────────────────────────────────────────────────────────────────────────────

import type { MaintenanceCsvRow } from "./types.js";

// ── Known Maximo type-hint values (second row in exported CSVs) ───────────────

const MAXIMO_TYPE_HINTS = new Set(["string", "float", "integer", "datetime"]);

// ── Low-level parsing ─────────────────────────────────────────────────────────

/**
 * Splits one CSV line into fields, respecting RFC-4180 double-quote escaping.
 * "he said ""hi""" → `he said "hi"`
 */
export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i] as string;
    const next = line[i + 1];

    // Escaped double-quote inside a quoted field
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

/**
 * Returns true when the row contains only Maximo type-hint strings.
 * Used to skip the second header row that Maximo exports.
 */
export function isMaximoTypeRow(cells: string[]): boolean {
  return (
    cells.length > 0 &&
    cells.every((cell) => MAXIMO_TYPE_HINTS.has(cell.trim().toLowerCase()))
  );
}

// ── High-level CSV parse ──────────────────────────────────────────────────────

/**
 * Parses a full CSV text into an array of row objects.
 * - Header row  → keys (lowercased)
 * - Row 2       → skipped if it looks like a Maximo type-hint row
 * - Remaining   → one object per non-empty line
 */
export function parseCsv(csvText: string): MaintenanceCsvRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLine = lines[0];
  if (!firstLine) return [];

  const headers = parseCsvLine(firstLine).map((h) => h.toLowerCase());

  const secondLine = lines[1];
  const dataStart =
    secondLine && isMaximoTypeRow(parseCsvLine(secondLine)) ? 2 : 1;

  return lines.slice(dataStart).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j] as string] = values[j] ?? "";
    }
    return row as MaintenanceCsvRow;
  });
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Returns a Map<alias, row> keeping only the row with the most recent
 * `reportdate` for each bus alias.  Rows without an alias are discarded.
 */
export function latestRowByAlias(
  rows: MaintenanceCsvRow[]
): Map<string, MaintenanceCsvRow> {
  const out = new Map<string, MaintenanceCsvRow>();

  for (const row of rows) {
    const alias = row["alias"] ?? "";
    if (!alias) continue;

    const existing = out.get(alias);
    if (!existing) {
      out.set(alias, row);
      continue;
    }

    const existingDate = safeParseDate(existing["reportdate"] ?? "");
    const rowDate = safeParseDate(row["reportdate"] ?? "");

    if (!existingDate || (rowDate && rowDate > existingDate)) {
      out.set(alias, row);
    }
  }

  return out;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Parses a string to a finite number, returning 0 on failure. */
export function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Parses a date string, returning null when invalid or empty. */
export function safeParseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
