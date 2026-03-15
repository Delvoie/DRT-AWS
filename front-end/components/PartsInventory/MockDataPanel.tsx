// src/components/mock/MockDataPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Developer/demo panel for generating, inspecting, and downloading mock data.
// Accessible from the main dashboard via a toggle.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState, useCallback } from "react";
import { generateMockBusRecords } from "@/lib/mockData";
import { RiskLevel, type BusRecord } from "@/lib/types";
import { RiskBadge, ServiceBadge, StatusBadge, Button, SectionHeader } from "@/components/PartsInventory/ui";

export function MockDataPanel() {
  const [buses, setBuses] = useState<BusRecord[]>([]);
  const [generated, setGenerated] = useState(false);
  const [view, setView] = useState<"buses" | "history" | "parts">("buses");
  const [selectedBus, setSelectedBus] = useState<BusRecord | null>(null);
  const [filterRisk, setFilterRisk] = useState<RiskLevel | "ALL">("ALL");

  const generate = useCallback(async () => {
    const fresh = generateMockBusRecords();
    setBuses(fresh);
    setGenerated(true);
    setSelectedBus(null);

    // Trigger SNS alerts based on the new data
    try {
      console.log("[MockDataPanel] Triggering predictive alerts...");
      const response = await fetch("/api/predictive-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buses: fresh }),
      });
      const result = await response.json();
      console.log("[MockDataPanel] Alerts response:", result);
    } catch (error) {
      console.error("[MockDataPanel] Failed to trigger alerts:", error);
    }
  }, []);

  const downloadJson = useCallback(() => {
    const data = JSON.stringify(buses, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "mock-bus-data.json"; a.click();
    URL.revokeObjectURL(url);
  }, [buses]);

  const downloadCsv = useCallback(() => {
    const headers = ["alias","manufacturer","location","assetStatus","riskLevel","riskScore",
      "odometerKm","nextTriggerKm","kmToNext","unitsLate","daysLate","tolerance",
      "currentJobPlan","pmNum","workOrderNum","reportDate"];
    const rows = buses.map(b => [
      b.alias, b.manufacturer, b.location, b.assetStatus, b.riskLevel, b.riskScore,
      b.pm.odometerKm, b.pm.nextTriggerKm, b.pm.kmToNext, b.pm.unitsLate, b.pm.daysLate,
      b.pm.tolerance, b.pm.currentJobPlan, b.pm.pmNum, b.pm.workOrderNum,
      b.pm.reportDate?.toISOString() ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "mock-bus-data.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [buses]);

  const filtered = filterRisk === "ALL"
    ? buses
    : buses.filter(b => b.riskLevel === filterRisk);

  const stats = {
    total:    buses.length,
    critical: buses.filter(b => b.riskLevel === RiskLevel.Critical).length,
    warning:  buses.filter(b => b.riskLevel === RiskLevel.Warning).length,
    stable:   buses.filter(b => b.riskLevel === RiskLevel.Stable).length,
    totalEntries: buses.reduce((sum, b) => sum + b.maintenanceHistory.length, 0),
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <SectionHeader
        title="Mock Data Generator"
        sub="Generate realistic sample buses and maintenance history for development and demos"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={generate}>
          ⟳ Generate Fresh Data
        </Button>
        {generated && (
          <>
            <Button variant="secondary" onClick={downloadJson}>↓ JSON</Button>
            <Button variant="secondary" onClick={downloadCsv}>↓ CSV</Button>
          </>
        )}
      </div>

      {!generated ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center text-stone-400">
          <p className="text-sm">Click <strong>Generate Fresh Data</strong> to create sample buses</p>
          <p className="mt-1 text-xs">Data is seeded from the real bus ranges in the PDF parts catalogue</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Buses",          value: stats.total,        color: "text-stone-800" },
              { label: "Critical",       value: stats.critical,     color: "text-red-600"   },
              { label: "Warning",        value: stats.warning,      color: "text-amber-600" },
              { label: "Stable",         value: stats.stable,       color: "text-emerald-700" },
              { label: "History entries",value: stats.totalEntries, color: "text-stone-800" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{s.label}</p>
                <p className={`mt-1 text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-stone-200">
            {(["buses","history","parts"] as const).map(t => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors capitalize ${
                  view === t
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Bus table */}
          {view === "buses" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["ALL", RiskLevel.Critical, RiskLevel.Warning, RiskLevel.Stable] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRisk(r)}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                      filterRisk === r
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <span className="ml-auto self-center text-xs text-stone-400">{filtered.length} buses</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-xs">
                    <thead className="bg-stone-100">
                      <tr>
                        {["Bus","Manufacturer","Location","Status","Risk","Service","Odometer","Units Late","Days Late","WO #","Report Date"].map(h => (
                          <th key={h} className="border-b border-stone-200 px-3 py-2.5 text-left font-semibold text-stone-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filtered.map(bus => (
                        <tr
                          key={bus.alias}
                          onClick={() => setSelectedBus(selectedBus?.alias === bus.alias ? null : bus)}
                          className={`cursor-pointer border-b border-stone-100 hover:bg-amber-50/40 ${selectedBus?.alias === bus.alias ? "bg-teal-50/40" : ""}`}
                        >
                          <td className="px-3 py-2 font-mono font-bold text-stone-800">{bus.alias}</td>
                          <td className="px-3 py-2 text-stone-600">{bus.manufacturer}</td>
                          <td className="px-3 py-2 text-stone-600">{bus.location}</td>
                          <td className="px-3 py-2">
                            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${bus.assetStatus === "DOWN" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
                              {bus.assetStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2"><RiskBadge level={bus.riskLevel} size="xs" /></td>
                          <td className="px-3 py-2"><ServiceBadge level={bus.currentServiceLevel} /></td>
                          <td className="px-3 py-2 font-mono text-stone-600">{bus.pm.odometerKm.toLocaleString()}</td>
                          <td className={`px-3 py-2 font-mono font-semibold ${bus.pm.unitsLate > 0 ? "text-red-600" : "text-stone-400"}`}>
                            {bus.pm.unitsLate > 0 ? `+${bus.pm.unitsLate.toLocaleString()}` : "—"}
                          </td>
                          <td className={`px-3 py-2 font-mono font-semibold ${bus.pm.daysLate > 0 ? "text-amber-600" : "text-stone-400"}`}>
                            {bus.pm.daysLate > 0 ? `${bus.pm.daysLate}d` : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-stone-400">{bus.pm.workOrderNum}</td>
                          <td className="px-3 py-2 text-stone-400">{bus.pm.reportDate?.toLocaleDateString() ?? "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expanded bus detail */}
              {selectedBus && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
                  <p className="mb-2 text-xs font-bold text-teal-700">Bus {selectedBus.alias} — Full Record (JSON preview)</p>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-stone-200 bg-white p-3 text-[10px] text-stone-700">
                    {JSON.stringify({ alias: selectedBus.alias, pm: selectedBus.pm, serviceSpec: selectedBus.serviceSpec?.rangeLabel }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* History entries */}
          {view === "history" && (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-xs">
                  <thead className="bg-stone-100">
                    <tr>
                      {["Bus","Service","Status","Technician","Garage","Odometer","Scheduled","Parts","WO #"].map(h => (
                        <th key={h} className="border-b border-stone-200 px-3 py-2.5 text-left font-semibold text-stone-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {buses.flatMap(b =>
                      b.maintenanceHistory.map(e => (
                        <tr key={e.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="px-3 py-2 font-mono font-bold text-stone-800">{e.busAlias}</td>
                          <td className="px-3 py-2"><ServiceBadge level={e.serviceLevel} /></td>
                          <td className="px-3 py-2"><StatusBadge status={e.status} /></td>
                          <td className="px-3 py-2 text-stone-600">{e.performedBy}</td>
                          <td className="px-3 py-2 text-stone-600">{e.garage}</td>
                          <td className="px-3 py-2 font-mono text-stone-500">{e.odometerAtService.toLocaleString()}</td>
                          <td className="px-3 py-2 text-stone-500">{e.scheduledDate.toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-stone-400">{e.partsUsed.length} parts</td>
                          <td className="px-3 py-2 font-mono text-stone-400">{e.workOrderNum}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parts coverage */}
          {view === "parts" && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                Parts catalogue coverage — all bus ranges from the PDF, with parts per service level.
              </p>
              {buses
                .filter((b, i, arr) => arr.findIndex(x => x.rangeLabel === b.rangeLabel) === i)
                .map(bus => (
                  <div key={bus.rangeLabel} className="rounded-xl border border-stone-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-stone-700">{bus.rangeLabel}</span>
                      <span className="text-xs text-stone-400">{bus.manufacturer}</span>
                      {bus.serviceSpec?.notes && (
                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                          {bus.serviceSpec.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {bus.serviceSpec?.parts.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-2 py-0.5">
                          <span className="text-[10px] text-stone-600">{p.partName}</span>
                          <span className="font-mono text-[9px] text-stone-400">{p.partNumber}</span>
                          <span className="flex gap-0.5">
                            {p.serviceLevel.map(l => (
                              <span key={l} className="rounded bg-stone-200 px-1 text-[8px] font-bold text-stone-600">{l}</span>
                            ))}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
