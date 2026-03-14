// src/components/FleetDashboard.tsx
// Top-level client component.
// - Loads report from /api/fleet-report (server-side CSVs) on mount
// - Accepts an uploaded report from CSVUploadPanel, which replaces the server report
// - Owns drawer state (selected asset), filter state, and export action

"use client";

import { useCallback, useState } from "react";
import { useFleetReport } from "@/hooks/useFleetReport";
import { useFleetFilters } from "@/hooks/useFleetFilters";
import { exportReport } from "@/lib/export";
import type { BusRiskDetails, BusRiskReport } from "@/lib/types";

import { FleetSummaryCards } from "./FleetSummaryCards";
import { DepotBreakdown } from "./DepotBreakdown";
import { FilterBar } from "./FilterBar";
import { RiskTable } from "./RiskTable";
import { AssetDrawer } from "./AssetDrawer";
import { CSVUploadPanel } from "./CSVUploadPanel";

export function FleetDashboard() {
  const { report: serverReport, status, error, refresh } = useFleetReport();

  const [uploadedReport, setUploadedReport] = useState<BusRiskReport | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const report = uploadedReport ?? serverReport;

  const [selectedAsset, setSelectedAsset] = useState<BusRiskDetails | null>(null);
  const closeDrawer = useCallback(() => setSelectedAsset(null), []);

  const { filters, setQuery, setRiskLevel, filtered } = useFleetFilters(
    report?.assets ?? []
  );

  const handleUploadReady = useCallback((r: BusRiskReport) => {
    setUploadedReport(r);
    setShowUpload(false);
  }, []);

  const handleExport = useCallback(() => {
    if (report) exportReport(report);
  }, [report]);

  const isLoading = status === "loading" && !report;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#f4efe6] to-[#fff9f0] p-4 sm:p-8">
        <div className="mx-auto max-w-[1280px] space-y-4">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/90 shadow-xl shadow-stone-200/60 backdrop-blur-sm">

            <header className="border-b border-stone-200 bg-[repeating-linear-gradient(-45deg,rgba(255,180,73,0.09),rgba(255,180,73,0.09)_14px,rgba(255,255,255,0.65)_14px,rgba(255,255,255,0.65)_28px)] px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                    DRT Fleet Risk Tracker
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm text-stone-500">
                    Preventative maintenance risk from current and previous PM snapshots —
                    sorted highest risk first, with delta tracking and data-quality flags.
                  </p>
                  {uploadedReport && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[0.68rem] font-medium text-teal-700">
                      ✓ Using uploaded snapshot
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowUpload((s) => !s)}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    {showUpload ? "✕ Close" : "↑ Upload CSV"}
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={!report}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ↓ Export CSV
                  </button>
                  <button
                    onClick={refresh}
                    disabled={status === "loading"}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 active:scale-95 disabled:cursor-wait disabled:opacity-50 transition-all"
                  >
                    {status === "loading" ? "Loading…" : "↻ Refresh"}
                  </button>
                </div>
              </div>
            </header>

            <div className="space-y-5 p-6">
              {showUpload && (
                <CSVUploadPanel onReportReady={handleUploadReady} />
              )}

              {status === "error" && error && !uploadedReport && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  <strong className="font-semibold">Failed to load server data:</strong> {error}
                  <p className="mt-1 text-xs text-red-500">
                    Place your CSVs at{" "}
                    <code className="font-mono">public/data/pm-current.csv</code> and{" "}
                    <code className="font-mono">public/data/pm-previous.csv</code>, or use{" "}
                    <strong>Upload CSV</strong> above.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-stone-100" />
                  ))}
                </div>
              )}

              {report && (
                <>
                  <FleetSummaryCards report={report} />
                  <DepotBreakdown depots={report.depots} />
                  <FilterBar
                    query={filters.query}
                    riskLevel={filters.riskLevel}
                    onQueryChange={setQuery}
                    onRiskLevelChange={setRiskLevel}
                    resultCount={filtered.length}
                    totalCount={report.assets.length}
                  />
                  <RiskTable assets={filtered} onSelect={setSelectedAsset} />
                </>
              )}
            </div>

            <footer
              className="border-t border-stone-100 px-6 py-3 text-xs text-stone-400"
              aria-live="polite"
            >
              {report
                ? `${filtered.length} of ${report.assets.length} assets shown · click any row for details`
                : status === "loading"
                ? "Loading CSV data…"
                : ""}
            </footer>
          </div>
        </div>
      </div>

      <AssetDrawer asset={selectedAsset} onClose={closeDrawer} />
    </>
  );
}
