// src/components/bus/BusDetailPanel.tsx
"use client";

import { useState } from "react";
import type { BusRecord, MaintenanceEntry, ServiceLevel } from "@/lib/types";
import { getPartsForServiceLevel, getSpecForAlias } from "@/lib/partsCatalogue";
import {
  RiskBadge, ServiceBadge, StatusBadge, OdometerBar,
  SectionHeader, KpiCard, EmptyState, Button
} from "@/components/PartsInventory/ui";
import type { UseBusDetailResult } from "@/hooks/useBusDashboard";

type Tab = "overview" | "parts" | "history";

interface Props {
  detail:      UseBusDetailResult;
  onNewEntry:  (bus: BusRecord) => void;
  onEditEntry: (entry: MaintenanceEntry) => void;
}

export function BusDetailPanel({ detail, onNewEntry, onEditEntry }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const { bus, history, deleteEntry } = detail;

  if (!bus) {
    return (
      <div className="flex h-full items-center justify-center bg-[#fafaf8]">
        <div className="text-center text-stone-400">
          <div className="mb-3 text-5xl opacity-20">🚌</div>
          <p className="text-sm font-medium">Select a bus to view details</p>
          <p className="mt-1 text-xs">Click any bus in the list on the left</p>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "parts",    label: `Parts (${bus.serviceSpec?.parts.length ?? 0})` },
    { id: "history",  label: `History (${history.length})` },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-stone-200 bg-[repeating-linear-gradient(-45deg,rgba(255,180,73,0.07),rgba(255,180,73,0.07)_10px,transparent_10px,transparent_20px)] px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-2xl font-black text-stone-800">Bus {bus.alias}</h2>
              <RiskBadge level={bus.riskLevel} size="sm" />
              <ServiceBadge level={bus.currentServiceLevel} />
              <span className={`rounded border px-2 py-0.5 text-xs font-medium ${
                bus.assetStatus === "DOWN" ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"
              }`}>{bus.assetStatus}</span>
            </div>
            <p className="mt-1 text-sm text-stone-500">{bus.assetDescription}</p>
            <p className="text-xs text-stone-400">{bus.location} · PM {bus.pm.pmNum} · WO {bus.pm.workOrderNum}</p>
          </div>
          <Button variant="primary" onClick={() => onNewEntry(bus)}>
            + New Entry
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-200 bg-stone-50 px-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && <OverviewTab bus={bus} />}
        {tab === "parts"    && <PartsTab bus={bus} />}
        {tab === "history"  && (
          <HistoryTab
            history={history}
            onEdit={onEditEntry}
            onDelete={deleteEntry}
          />
        )}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ bus }: { bus: BusRecord }) {
  const { pm } = bus;
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Odometer"    value={pm.odometerKm.toLocaleString()} sub="km" />
        <KpiCard label="Units Late"  value={pm.unitsLate.toLocaleString()}  sub="km" accent={pm.unitsLate > pm.tolerance ? "critical" : pm.unitsLate > 0 ? "warning" : "stable"} />
        <KpiCard label="Days Late"   value={pm.daysLate} sub="days"          accent={pm.daysLate > 14 ? "critical" : pm.daysLate > 0 ? "warning" : "stable"} />
        <KpiCard label="Next Trigger" value={pm.nextTriggerKm.toLocaleString()} sub="km" />
      </div>

      {/* Service window */}
      <div className="rounded-xl border border-stone-200 p-4">
        <SectionHeader title="Service window" />
        <div className="mt-4">
          <OdometerBar kmToNext={pm.kmToNext} frequency={pm.frequency} unitsLate={pm.unitsLate} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {[
            ["PM Number",       pm.pmNum],
            ["Frequency",       `${pm.frequency.toLocaleString()} km`],
            ["Tolerance",       `${pm.tolerance.toLocaleString()} km`],
            ["Last PM Reading", `${pm.lastPMReading.toLocaleString()} km`],
            ["Current Plan",    pm.currentJobPlan],
            ["Scheduled Plan",  pm.jobPlanDescription],
            ["Report Date",     pm.reportDate?.toLocaleDateString() ?? "N/A"],
            ["Asset #",         pm.assetNum],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-stone-50 px-3 py-2">
              <p className="text-[10px] text-stone-400">{k}</p>
              <p className="mt-0.5 font-medium text-stone-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spec notes */}
      {bus.serviceSpec?.notes && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>ℹ Spec note:</strong> {bus.serviceSpec.notes}
        </div>
      )}
    </div>
  );
}

// ── Parts tab ─────────────────────────────────────────────────────────────────

function PartsTab({ bus }: { bus: BusRecord }) {
  const [selectedLevel, setSelectedLevel] = useState<ServiceLevel>(bus.currentServiceLevel);
  const spec = getSpecForAlias(bus.alias);

  if (!spec) {
    return <EmptyState message="No parts specification found for this bus range." />;
  }

  const parts = getPartsForServiceLevel(spec, selectedLevel);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-stone-500">View parts for service:</span>
        {(["A","B","C","D"] as ServiceLevel[]).map(l => (
          <button
            key={l}
            onClick={() => setSelectedLevel(l)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedLevel === l ? "border-teal-600 bg-teal-600 text-white" : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            {l} Service
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-400">
        Range: <strong className="text-stone-600">{spec.rangeLabel}</strong> ·{" "}
        {parts.length} parts required{selectedLevel !== "A" ? " (cumulative)" : ""}
      </p>

      <div className="overflow-hidden rounded-xl border border-stone-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-stone-100">
            <tr>
              {["Part Name","Part #","Qty","Unit","Service Levels","Notes"].map(h => (
                <th key={h} className="border-b border-stone-200 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-stone-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parts.map((p, i) => (
              <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-2.5 font-medium text-stone-800">{p.partName}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-stone-600">{p.partNumber}</td>
                <td className="px-4 py-2.5 text-stone-600">{p.quantity ?? 1}</td>
                <td className="px-4 py-2.5 text-stone-500">{p.unit ?? "each"}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {p.serviceLevel.map(sl => <ServiceBadge key={sl} level={sl} />)}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-stone-400">{p.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({
  history, onEdit, onDelete,
}: {
  history: MaintenanceEntry[];
  onEdit: (e: MaintenanceEntry) => void;
  onDelete: (id: string) => void;
}) {
  if (!history.length) return <EmptyState message="No maintenance history recorded." />;

  return (
    <div className="space-y-3">
      {history.map(entry => (
        <div key={entry.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ServiceBadge level={entry.serviceLevel} />
              <StatusBadge status={entry.status} />
              <span className="font-mono text-xs text-stone-400">{entry.workOrderNum}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs" onClick={() => onEdit(entry)}>Edit</Button>
              <Button variant="ghost" className="text-xs text-red-500 hover:bg-red-50" onClick={() => {
                if (confirm("Delete this entry?")) onDelete(entry.id);
              }}>Delete</Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            <p><span className="text-stone-400">Date: </span><span className="text-stone-700">{entry.scheduledDate.toLocaleDateString()}</span></p>
            <p><span className="text-stone-400">By: </span><span className="text-stone-700">{entry.performedBy}</span></p>
            <p><span className="text-stone-400">Odometer: </span><span className="text-stone-700">{entry.odometerAtService.toLocaleString()} km</span></p>
            <p><span className="text-stone-400">Garage: </span><span className="text-stone-700">{entry.garage}</span></p>
          </div>

          {entry.partsUsed.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.partsUsed.map((p, i) => (
                <span key={i} className="rounded border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-[10px] text-stone-600">
                  {p.partNumber} × {p.quantityUsed}
                </span>
              ))}
            </div>
          )}

          {entry.notes && (
            <p className="mt-2 text-xs italic text-stone-500">"{entry.notes}"</p>
          )}
        </div>
      ))}
    </div>
  );
}
