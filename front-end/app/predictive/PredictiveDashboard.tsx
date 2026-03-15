// components/Predictive/PredictiveDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full predictive dashboard page.
// All data flows through useFleetPredictive — swap mock for real API there only.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useMemo, useState } from "react";
import { useFleetPredictive } from "@/hooks/usePredictive";
import { getMockBuses } from "@/lib/mockData";
import { getMockPartHealthRecords } from "@/lib/predictive/mockPredictiveData";
import { currentSeason, SEASONAL_MULTIPLIERS } from "@/lib/predictive/seasonalModel";
import type { NotificationPriority, PartHealthRecord, PredictiveNotification } from "@/lib/types/predictive";
import { PartHealthBar } from "../../components/Predictive/PartHealthBar";

// ── Shared style helpers ──────────────────────────────────────────────────────

function priorityLeftBorder(p: NotificationPriority) {
  return p === "CRITICAL" ? "border-l-4 border-l-red-500 bg-red-50"
       : p === "HIGH"     ? "border-l-4 border-l-amber-400 bg-amber-50"
       : p === "MEDIUM"   ? "border-l-4 border-l-blue-400 bg-blue-50"
       :                    "border-l-4 border-l-stone-300 bg-stone-50";
}

function priorityPill(p: NotificationPriority) {
  return p === "CRITICAL" ? "bg-red-600 text-white"
       : p === "HIGH"     ? "bg-amber-500 text-white"
       : p === "MEDIUM"   ? "bg-blue-600 text-white"
       :                    "bg-stone-400 text-white";
}

function heatCell(h: number) {
  if (h <= 20) return "bg-red-500 text-white font-bold";
  if (h <= 35) return "bg-orange-400 text-white font-bold";
  if (h <= 55) return "bg-amber-300 text-stone-800";
  if (h <= 75) return "bg-yellow-100 text-stone-700";
  return "bg-emerald-100 text-stone-600";
}

// ── Fleet summary banner ──────────────────────────────────────────────────────

function SummaryBanner({ data }: { data: ReturnType<typeof useFleetPredictive> }) {
  const { summary, isLoading } = data;
  const season = currentSeason();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">Fleet Health Overview</h2>
        <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium capitalize text-blue-700">
          {season} season
        </span>
        <span className="text-xs text-stone-400">· Durham Region, Ontario · March 2026</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Fleet Avg Health",    value: `${summary.avgFleetHealth}%`,  accent: summary.avgFleetHealth < 50 ? "text-red-600" : summary.avgFleetHealth < 70 ? "text-amber-600" : "text-emerald-700" },
          { label: "Critical Parts",      value: summary.criticalCount,         accent: summary.criticalCount > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Order Now",           value: summary.orderNowCount,         accent: summary.orderNowCount > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Order Soon",          value: summary.orderSoonCount,        accent: summary.orderSoonCount > 0 ? "text-amber-600" : "text-stone-800" },
          { label: "Seasonal Risk",       value: summary.seasonalRiskCount,     accent: summary.seasonalRiskCount > 5 ? "text-amber-600" : "text-stone-800" },
          { label: "Parts Tracked",       value: summary.totalParts,            accent: "text-stone-800" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
            <p className={`mt-1 text-2xl font-black ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notification card ─────────────────────────────────────────────────────────

function NotifCard({
  n,
  onDismiss,
  onSnooze,
}: {
  n: PredictiveNotification;
  onDismiss: () => void;
  onSnooze:  () => void;
}) {
  return (
    <div className={`rounded-xl border border-stone-200 p-4 shadow-sm ${priorityLeftBorder(n.priority)}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityPill(n.priority)}`}>
            {n.priority}
          </span>
          <span className="font-mono text-sm font-bold text-stone-700">Bus {n.busAlias}</span>
          <span className="text-sm font-medium text-stone-800">{n.title}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onSnooze}
            className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-50 active:scale-95"
          >
            Snooze 7d
          </button>
          <button
            onClick={onDismiss}
            className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-50 active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-stone-600">{n.body}</p>

      <div className="mt-3">
        <PartHealthBar healthPct={n.healthPct} size="sm" showPct />
      </div>

      {n.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {n.tags.slice(0, 5).map(key => (
            <span
              key={key}
              className="rounded border border-stone-200 bg-white/80 px-1.5 py-0.5 text-[10px] text-stone-500"
            >
              {key}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-stone-400">
        {n.projectedFailureKm != null && (
          <span>Failure @ <strong className="text-stone-600">{n.projectedFailureKm.toLocaleString()} km</strong></span>
        )}
        {n.orderByDate && (
          <span>Order by <strong className="text-stone-600">{n.orderByDate.toLocaleDateString("en-CA")}</strong></span>
        )}
        <span>Urgency score: <strong className="text-stone-600">{n.urgencyScore}</strong></span>
      </div>
    </div>
  );
}

// ── Priority queue tab ────────────────────────────────────────────────────────

function NotificationQueue({ data }: { data: ReturnType<typeof useFleetPredictive> }) {
  const {
    filteredNotifications,
    priorityFilter,
    setPriorityFilter,
    counts,
    dismiss,
    snooze,
    isLoading,
  } = data;

  const FILTERS: (NotificationPriority | "ALL")[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const countLabel = (p: NotificationPriority | "ALL") => {
    if (p === "ALL") return filteredNotifications.length > 0 && priorityFilter === "ALL"
      ? ` (${filteredNotifications.length})` : "";
    return counts[p] > 0 ? ` (${counts[p]})` : "";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-stone-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-stone-500">Priority:</span>
        {FILTERS.map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              priorityFilter === p
                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
            }`}
          >
            {p}{countLabel(p)}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400">
          {filteredNotifications.length} active notification{filteredNotifications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 py-16 text-center">
          <div className="mb-2 text-3xl">✓</div>
          <p className="text-sm font-medium text-stone-500">
            No active notifications{priorityFilter !== "ALL" ? ` at ${priorityFilter} priority` : ""}
          </p>
          <p className="mt-1 text-xs text-stone-400">All parts are within acceptable health thresholds.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(n => (
            <NotifCard
              key={n.id}
              n={n}
              onDismiss={() => dismiss(n.id)}
              onSnooze={() => snooze(n.id, 7)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fleet heat map tab ────────────────────────────────────────────────────────

function FleetHeatMap() {
  const buses   = useMemo(() => getMockBuses(), []);
  const records = useMemo(() => getMockPartHealthRecords(), []);

  // Collect unique part names ordered by how commonly they appear
  const partNames = useMemo(() => {
    const freq = new Map<string, number>();
    records.forEach(r => freq.set(r.partName, (freq.get(r.partName) ?? 0) + 1));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [records]);

  // busAlias → partName → healthPct
  const index = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    records.forEach(r => {
      if (!m.has(r.busAlias)) m.set(r.busAlias, new Map());
      m.get(r.busAlias)!.set(r.partName, r.healthPct);
    });
    return m;
  }, [records]);

  // Sort buses by lowest min-health first (most urgent at top)
  const sortedBuses = useMemo(() =>
    [...buses].sort((a, b) => {
      const minA = Math.min(...(partNames.map(p => index.get(a.alias)?.get(p) ?? 100)));
      const minB = Math.min(...(partNames.map(p => index.get(b.alias)?.get(p) ?? 100)));
      return minA - minB;
    }),
    [buses, partNames, index]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">Fleet Heat Map</h2>
        <span className="text-xs text-stone-400">Buses sorted by worst part health · values are health %</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#1c2a2f]">
              <th className="sticky left-0 z-10 bg-[#1c2a2f] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-stone-300">
                Bus
              </th>
              {partNames.map(name => (
                <th
                  key={name}
                  className="px-1.5 py-2.5 text-center text-[10px] font-medium text-stone-400"
                  style={{ minWidth: 52 }}
                >
                  <span
                    className="block truncate"
                    style={{ maxWidth: 52 }}
                    title={name}
                  >
                    {name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedBuses.map((bus, bi) => {
              const busMap = index.get(bus.alias);
              const rowBg  = bi % 2 === 0 ? "bg-white" : "bg-stone-50";
              return (
                <tr key={bus.alias}>
                  <td className={`sticky left-0 z-10 border-r border-stone-200 px-4 py-2 font-mono text-xs font-bold text-stone-700 ${rowBg}`}>
                    {bus.alias}
                  </td>
                  {partNames.map(name => {
                    const h = busMap?.get(name);
                    return (
                      <td
                        key={name}
                        title={h != null ? `${name}: ${h.toFixed(0)}%` : `${name}: no data`}
                        className={`px-1 py-2 text-center tabular-nums ${h != null ? heatCell(h) : "text-stone-200"}`}
                      >
                        {h != null ? h.toFixed(0) : "–"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span className="font-semibold">Health legend:</span>
        {[
          { label: "≤20% Critical",  cls: "bg-red-500 text-white" },
          { label: "≤35% High",      cls: "bg-orange-400 text-white" },
          { label: "≤55% Medium",    cls: "bg-amber-300 text-stone-800" },
          { label: "≤75% Watch",     cls: "bg-yellow-100 text-stone-700" },
          { label: ">75% Good",      cls: "bg-emerald-100 text-stone-600" },
        ].map(({ label, cls }) => (
          <span key={label} className={`rounded px-2 py-0.5 text-[10px] font-medium ${cls}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Seasonal outlook tab ──────────────────────────────────────────────────────

function SeasonalOutlook() {
  const CATEGORIES = ["brake", "fluid", "filter", "hvac", "drivetrain", "electrical"] as const;
  const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentMonth = new Date().getMonth(); // 0-indexed

  function multCell(mult: number, isCurrent: boolean) {
    const pct = Math.round((mult - 1) * 100);
    const bg  = mult >= 1.5 ? "bg-red-200 text-red-800 font-bold"
              : mult >= 1.3 ? "bg-amber-200 text-amber-800 font-bold"
              : mult >= 1.1 ? "bg-yellow-100 text-yellow-700"
              : "text-stone-400";
    return { bg, label: pct > 0 ? `+${pct}%` : "–", isCurrent };
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">Seasonal Wear Multipliers</h2>
        <span className="text-xs text-stone-400">
          Current month highlighted · values show how much faster parts degrade
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-stone-500" style={{ minWidth: 100 }}>
                Category
              </th>
              {MONTHS.map((m, i) => (
                <th
                  key={m}
                  className={`px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide ${
                    i === currentMonth
                      ? "bg-teal-700 text-white"
                      : "text-stone-400"
                  }`}
                  style={{ minWidth: 44 }}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, ci) => {
              const row = SEASONAL_MULTIPLIERS[cat];
              return (
                <tr key={cat} className={ci % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                  <td className="px-4 py-2.5 font-semibold capitalize text-stone-700">{cat}</td>
                  {row.map((mult, mi) => {
                    const { bg, label, isCurrent } = multCell(mult, mi === currentMonth);
                    return (
                      <td
                        key={mi}
                        className={`px-1.5 py-2.5 text-center tabular-nums ${bg} ${isCurrent ? "ring-2 ring-inset ring-teal-600" : ""}`}
                      >
                        {label}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500 space-y-1">
        <p>
          <span className="font-semibold text-stone-700">How to read this:</span>{" "}
          A value of +50% means the part degrades 50% faster than baseline that month.
          The algorithm divides <code className="bg-stone-100 px-1 rounded">expectedLifeKm</code> by the multiplier
          to shorten the adjusted life.
        </p>
        <p>
          <span className="font-semibold text-stone-700">March 2026 context:</span>{" "}
          Brake wear is still elevated at +30% from road salt. HVAC is transitioning off peak winter load (+20%).
          Most categories returning to baseline.
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type DashView = "notifications" | "heatmap" | "seasonal";

const VIEWS: { id: DashView; label: string; icon: string }[] = [
  { id: "notifications", label: "Priority Queue",    icon: "🔔" },
  { id: "heatmap",       label: "Fleet Heat Map",    icon: "🌡" },
  { id: "seasonal",      label: "Seasonal Outlook",  icon: "❄️"  },
];

export default function PredictiveDashboard() {
  const predictive = useFleetPredictive();
  const [view, setView] = useState<DashView>("notifications");

  const criticalCount  = predictive.counts.CRITICAL;
  const highCount      = predictive.counts.HIGH;
  const urgentTotal    = criticalCount + highCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4efe6] to-[#fff9f0] p-4 sm:p-8">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/90 shadow-xl shadow-stone-200/60 backdrop-blur-sm">

          {/* Page header */}
          <header className="border-b border-stone-200 bg-[repeating-linear-gradient(-45deg,rgba(255,180,73,0.09),rgba(255,180,73,0.09)_14px,rgba(255,255,255,0.65)_14px,rgba(255,255,255,0.65)_28px)] px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight text-stone-800">
                      🔮 Predictive Parts Dashboard
                    </h1>
                    {urgentTotal > 0 && (
                      <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        {urgentTotal} urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-stone-500">
                    AI-driven part health · predictive ordering · seasonal degradation modelling
                  </p>
                </div>
              </div>

              {/* View switcher */}
              <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
                {VIEWS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      view === id
                        ? "bg-teal-700 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-8 p-6">
            {/* Summary always visible */}
            <SummaryBanner data={predictive} />

            {/* Active view */}
            {view === "notifications" && <NotificationQueue data={predictive} />}
            {view === "heatmap"       && <FleetHeatMap />}
            {view === "seasonal"      && <SeasonalOutlook />}
          </div>
        </div>
      </div>
    </div>
  );
}
