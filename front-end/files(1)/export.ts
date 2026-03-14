// src/lib/export.ts
// Converts a BusRiskReport into a downloadable CSV string and triggers a browser download.
// Pure utility — no React, no DOM reads, just string construction.

import type { BusRiskDetails, BusRiskReport } from "./types";

// ── CSV building ──────────────────────────────────────────────────────────────

function escapeCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCell).join(",");
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date as unknown as string);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 16).replace("T", " ");
}

const HEADERS = [
  "Bus Number",
  "Asset Description",
  "Asset Type",
  "Location",
  "Asset Status",
  "Risk Level",
  "Risk Score",
  "Risk Label",
  "Risk Ratio",
  "Odometer (km)",
  "Next Service (km)",
  "Km To Next Service",
  "Units Late (km)",
  "Units Late Delta",
  "Days Overdue",
  "Days Late Delta",
  "Over Tolerance (km)",
  "Tolerance (km)",
  "Year Built",
  "Age (years)",
  "Current Job Plan",
  "Next Job Plan",
  "Data Freshness",
  "Data Gaps",
  "Risk Factors",
  "Report Date",
];

function assetToRow(a: BusRiskDetails): string {
  return row([
    a.busNumber,
    a.assetDescription,
    a.assetType,
    a.location,
    a.assetStatus,
    a.riskLevel,
    a.riskScore,
    a.riskLabel,
    a.riskRatio.toFixed(4),
    a.odometerKm,
    a.nextServiceKm,
    a.kmToNextService,
    a.unitsLate,
    a.unitsLateDelta ?? "",
    a.daysOverdue,
    a.daysLateDelta ?? "",
    a.overToleranceByKm,
    a.toleranceKm,
    a.yearBuilt ?? "",
    a.ageYears ?? "",
    a.currentJobPlan,
    a.nextJobPlan,
    a.dataFreshness,
    a.dataGaps.join("; "),
    a.riskFactors.join("; "),
    formatDate(a.reportDate),
  ]);
}

export function reportToCsv(report: BusRiskReport): string {
  const lines: string[] = [
    row(HEADERS),
    ...report.assets.map(assetToRow),
  ];
  return lines.join("\n");
}

// ── Browser download trigger ──────────────────────────────────────────────────

export function downloadCsv(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReport(report: BusRiskReport): void {
  const date = new Date().toISOString().slice(0, 10);
  const csv = reportToCsv(report);
  downloadCsv(csv, `drt-fleet-risk-${date}.csv`);
}
