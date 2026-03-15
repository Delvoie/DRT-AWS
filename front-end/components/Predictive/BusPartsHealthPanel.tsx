// components/Predictive/BusPartsHealthPanel.tsx
"use client";

import { useMemo } from "react";
import type { BusRecord } from "@/lib/types";
import type { PartHealthRecord } from "@/lib/types/predictive";
import { useBusPredictive } from "@/hooks/usePredictive";
import { PartHealthBar } from "./PartHealthBar";
import { PartTagList } from "./PartTagBadge";

function healthBg(h: number): string {
  if (h <= 20) return "bg-red-50 border-red-200";
  if (h <= 35) return "bg-amber-50 border-amber-200";
  if (h <= 60) return "bg-yellow-50 border-yellow-200";
  return "bg-white border-stone-200";
}

function urgentRing(record: PartHealthRecord): string {
  return record.tags.some(t => t.urgent) ? "ring-2 ring-red-400 ring-offset-1" : "";
}

function HealthSummaryBanner({ records }: { records: PartHealthRecord[] }) {
  const critical  = records.filter(r => r.healthPct <= 20).length;
  const orderNow  = records.filter(r => r.tags.some(t => t.key === "order_now")).length;
  const orderSoon = records.filter(r => r.tags.some(t => t.key === "order_soon")).length;
  const avgHealth = records.length
    ? Math.round(records.reduce((s, r) => s + r.healthPct, 0) / records.length)
    : 100;
  const worst = records[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Avg Health",    value: `${avgHealth}%`, accent: avgHealth < 40 ? "text-red-600" : avgHealth < 65 ? "text-amber-600" : "text-emerald-700" },
          { label: "Critical Parts", value: critical,       accent: critical > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Order Now",     value: orderNow,        accent: orderNow > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Order Soon",    value: orderSoon,       accent: orderSoon > 0 ? "text-amber-600" : "text-stone-800" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
            <p className={`mt-1 text-3xl font-black ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
      {worst && worst.healthPct < 60 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">⚠ Lowest health:</span>
          <span className="font-mono font-medium">{worst.partName}</span>
          <span>at <span className="font-bold">{worst.healthPct.toFixed(0)}%</span></span>
          {worst.projectedFailureKm != null && (
            <span>· failure @ <span className="font-bold">{worst.projectedFailureKm.toLocaleString()} km</span></span>
          )}
          {worst.orderByDate && (
            <span>· order by <span className="font-bold">{worst.orderByDate.toLocaleDateString("en-CA")}</span></span>
          )}
        </div>
      )}
    </div>
  );
}

function PartCard({ record }: { record: PartHealthRecord }) {
  const kmRemaining = record.projectedFailureKm != null
    ? Math.max(0, record.projectedFailureKm - record.odometerKm)
    : null;

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${healthBg(record.healthPct)} ${urgentRing(record)}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-stone-800">{record.partName}</p>
          <p className="font-mono text-[11px] text-stone-400">{record.partNumber}</p>
        </div>
        <div className="text-right text-[11px] text-stone-400">
          <p className="capitalize">{record.partCategory}</p>
          <p>×{record.seasonalMultiplier.toFixed(2)} seasonal</p>
        </div>
      </div>
      <div className="mt-3">
        <PartHealthBar healthPct={record.healthPct} size="md" showPct />
      </div>
      {record.tags.length > 0 && (
        <div className="mt-2">
          <PartTagList tags={record.tags} max={4} />
        </div>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
          <p className="text-[10px] text-stone-400">Failure @ km</p>
          <p className="font-bold text-stone-800">{record.projectedFailureKm?.toLocaleString() ?? "—"}</p>
        </div>
        <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
          <p className="text-[10px] text-stone-400">km Left</p>
          <p className="font-bold text-stone-800">{kmRemaining != null ? kmRemaining.toLocaleString() : "—"}</p>
        </div>
        <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
          <p className="text-[10px] text-stone-400">Order By</p>
          <p className={`font-bold ${record.tags.some(t => t.key === "order_now") ? "text-red-600" : "text-stone-800"}`}>
            {record.orderByDate?.toLocaleDateString("en-CA") ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BusPartsHealthPanel({ bus }: { bus: BusRecord }) {
  const { records: rawRecords } = useBusPredictive(bus);
  const records = useMemo(
    () => [...rawRecords].sort((a, b) => a.healthPct - b.healthPct),
    [rawRecords]
  );

  if (records.length === 0) {
    return (
      <div className="py-16 text-center text-stone-400">
        <div className="mb-3 text-4xl opacity-20">🔩</div>
        <p className="text-sm font-medium">No parts specification for this bus range.</p>
        <p className="mt-1 text-xs">Only buses with a matching entry in BUS_SERVICE_SPECS are supported.</p>
      </div>
    );
  }

  const month = new Intl.DateTimeFormat("en-CA", { month: "long" }).format(new Date());

  return (
    <div className="space-y-6">
      <HealthSummaryBanner records={records} />
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-400">
          All Parts — sorted by health (lowest first)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {records.map(r => (
            <PartCard key={`${r.busAlias}::${r.partName}`} record={r} />
          ))}
        </div>
      </div>
      <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
        <span className="font-semibold text-stone-700">Algorithm:</span> Composite weighted model
        (mileage + time decay). Seasonal multiplier applied for{" "}
        <span className="font-medium capitalize text-stone-700">{month}</span>{" "}
        in Durham Region, Ontario. Tags are re-computed each time this tab is opened.
      </p>
    </div>
  );
}
