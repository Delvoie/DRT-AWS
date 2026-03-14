// ─────────────────────────────────────────────────────────────────────────────
// main.ts — DRT Fleet Risk Tracker
// Application entry point: fetches CSVs, builds the report, wires up the UI.
// ─────────────────────────────────────────────────────────────────────────────

import { buildBusRiskReport } from "../risk.js";
import {
  bindFilterControls,
  filterAssets,
  renderRiskRows,
  renderStatus,
  renderSummaryCards,
} from "./ui.js";
import type { AppConfig, BusRiskReport, FilterState } from "../types.js";

// ── Configuration ─────────────────────────────────────────────────────────────

const APP_CONFIG: AppConfig = {
  csvPaths: {
    current:
      "../Full MAINTENANCE/Full MAINTENANCE/Preventative Maintenance Open Activities.csv",
    previous:
      "../Full MAINTENANCE/Full MAINTENANCE/20260212 Preventative Maintenance Open Activities.csv",
  },
  asOfDate: new Date("2026-03-14T00:00:00"),
};

// ── Module state ──────────────────────────────────────────────────────────────

let report: BusRiskReport | null = null;

// ── Filter handler ────────────────────────────────────────────────────────────

function applyFilters(state: FilterState): void {
  if (!report) return;

  const filtered = filterAssets(report.assets, state);

  renderRiskRows(filtered);
  renderStatus(
    `Showing ${filtered.length} of ${report.assets.length} assets from both CSV snapshots.`
  );
}

// ── Data loading ──────────────────────────────────────────────────────────────

async function fetchCsv(path: string): Promise<string> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Failed to load CSV: ${path} (HTTP ${response.status}). ` +
        "Ensure you are running from a local server and the paths are correct."
    );
  }
  return response.text();
}

async function loadData(config: AppConfig): Promise<void> {
  renderStatus("Loading CSV data…");

  const [currentCsv, previousCsv] = await Promise.all([
    fetchCsv(config.csvPaths.current),
    fetchCsv(config.csvPaths.previous),
  ]);

  report = buildBusRiskReport(currentCsv, previousCsv, config.asOfDate);

  renderSummaryCards(report);

  // Apply default (unfiltered) view
  applyFilters({ query: "", riskLevel: "ALL" });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function init(): void {
  bindFilterControls(applyFilters);

  loadData(APP_CONFIG).catch((err: unknown) => {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    renderStatus(message, true);
  });
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
