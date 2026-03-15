// components/Predictive/PredictiveDashboard.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useFleetPredictive } from "@/hooks/usePredictive";
import { getMockBuses } from "@/lib/mockData";
import { getMockPartHealthRecords } from "@/lib/predictive/mockPredictiveData";
import { currentSeason, SEASONAL_MULTIPLIERS } from "@/lib/predictive/seasonalModel";
import type { NotificationPriority, PredictiveNotification } from "@/lib/types/predictive";
import { PartHealthBar } from "@/components/Predictive/PartHealthBar";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO NOTIFICATIONS — hardcoded realistic data for presentations
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: PredictiveNotification[] = [
  {
    id: "demo-1",
    busAlias: "8501",
    partName: "Air Filter",
    partNumber: "6389969",
    priority: "CRITICAL",
    title: "⚡ Air Filter — Failure Risk",
    body: "Bus 8501: Air Filter (6389969) is at 8% health at 248,400 km. Projected failure at 249,200 km (~Mar 17, 2026). Immediate action required.",
    healthPct: 8,
    tags: ["failure_risk", "order_now", "winter_stress"],
    orderByDate: new Date("2026-03-16"),
    projectedFailureKm: 249200,
    urgencyScore: 98,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-2",
    busAlias: "6115",
    partName: "Brake Tr. Clip",
    partNumber: "6351580",
    priority: "CRITICAL",
    title: "⚡ Brake Tr. Clip — Failure Risk",
    body: "Bus 6115: Brake clip at 14% health at 312,100 km. Winter salt accelerating wear at ×1.50. Projected failure at 313,800 km (~Mar 19, 2026). Order part 6351580 now.",
    healthPct: 14,
    tags: ["failure_risk", "order_now", "seasonal_risk", "winter_stress"],
    orderByDate: new Date("2026-03-17"),
    projectedFailureKm: 313800,
    urgencyScore: 95,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-3",
    busAlias: "8425",
    partName: "Wabasto Cartridge",
    partNumber: "50900001A",
    priority: "CRITICAL",
    title: "⚡ Wabasto Cartridge — Failure Risk",
    body: "Bus 8425 (Westney Garage): Webasto heater cartridge at 18% health. Unit operates in Westney — heater is essential through March. Failure projected at 279,400 km (~Mar 20).",
    healthPct: 18,
    tags: ["failure_risk", "order_now", "winter_stress"],
    orderByDate: new Date("2026-03-18"),
    projectedFailureKm: 279400,
    urgencyScore: 92,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-4",
    busAlias: "8533",
    partName: "Dryer Cartridge",
    partNumber: "47178964",
    priority: "HIGH",
    title: "Dryer Cartridge — Order Now",
    body: "Bus 8533: Dryer Cartridge (×2 required) at 31% health. Lead time is 5 business days. Order by Mar 20 to beat projected failure at 261,000 km (~Mar 25, 2026).",
    healthPct: 31,
    tags: ["order_now", "seasonal_risk"],
    orderByDate: new Date("2026-03-20"),
    projectedFailureKm: 261000,
    urgencyScore: 79,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-5",
    busAlias: "7110",
    partName: "Transmission Filter",
    partNumber: "0501.216.503",
    priority: "HIGH",
    title: "Transmission Filter — Order Now",
    body: "Bus 7110: Transmission filter at 28% health at 190,800 km. 4,200 km to projected failure. Order 0501.216.503 immediately — 5-day lead time means it may not arrive in time.",
    healthPct: 28,
    tags: ["order_now", "mileage_due"],
    orderByDate: new Date("2026-03-18"),
    projectedFailureKm: 195000,
    urgencyScore: 76,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-6",
    busAlias: "8560",
    partName: "Coolant Filter",
    partNumber: "LFW4074",
    priority: "HIGH",
    title: "Cool. Filter West — Order Now",
    body: "Bus 8560: Coolant filter at 34% health. Cold-start thermal cycling has accelerated wear by +30% this winter. Failure projected ~Apr 1, 2026 at 228,600 km.",
    healthPct: 34,
    tags: ["order_now", "winter_stress", "wear_accelerated"],
    orderByDate: new Date("2026-03-22"),
    projectedFailureKm: 228600,
    urgencyScore: 71,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-7",
    busAlias: "0109",
    partName: "Fuel Filter",
    partNumber: "FS1065FLG",
    priority: "MEDIUM",
    title: "Fuel Filter — Order Soon",
    body: "Bus 0109: Fuel filter at 44% health. Estimated failure ~Apr 12, 2026 at 96,400 km. Consider ordering alongside next scheduled A service to avoid separate callout.",
    healthPct: 44,
    tags: ["order_soon"],
    orderByDate: new Date("2026-04-07"),
    projectedFailureKm: 96400,
    urgencyScore: 48,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-8",
    busAlias: "8608",
    partName: "Hydraulic Filter",
    partNumber: "6334006",
    priority: "MEDIUM",
    title: "Hydraulic Filter — Order Soon",
    body: "Bus 8608: Hydraulic filter at 49% health. Spring thaw and road debris will accelerate wear through April. Failure projected at 345,200 km (~Apr 18).",
    healthPct: 49,
    tags: ["order_soon", "seasonal_risk"],
    orderByDate: new Date("2026-04-13"),
    projectedFailureKm: 345200,
    urgencyScore: 44,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-9",
    busAlias: "6125",
    partName: "Wabasto Cartridge",
    partNumber: "50900001A",
    priority: "MEDIUM",
    title: "Wabasto Cartridge — Order Soon",
    body: "Bus 6125: Heater cartridge at 47% health. HVAC seasonal multiplier ×1.20 still active in March. Failure projected ~Apr 5, 2026. Bundle with next B service.",
    healthPct: 47,
    tags: ["order_soon", "winter_stress"],
    orderByDate: new Date("2026-03-31"),
    projectedFailureKm: 198700,
    urgencyScore: 42,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-10",
    busAlias: "8445",
    partName: "Barium Grease",
    partNumber: "246671",
    priority: "LOW",
    title: "Barium Grease — Seasonal Risk",
    body: "Bus 8445: Road salt and brine exposure accelerates brake wear +30% in March. Barium grease at 61% health — monitor closely; schedule re-application at next C service.",
    healthPct: 61,
    tags: ["seasonal_risk", "winter_stress"],
    orderByDate: null,
    projectedFailureKm: 198000,
    urgencyScore: 22,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-11",
    busAlias: "7124",
    partName: "DEF Filter",
    partNumber: "19401695",
    priority: "LOW",
    title: "DEF Filter — Monitor",
    body: "Bus 7124: DEF filter at 58% health. No immediate action needed. Flag for ordering at next scheduled D service interval (~May 2026).",
    healthPct: 58,
    tags: ["mileage_due"],
    orderByDate: null,
    projectedFailureKm: 420000,
    urgencyScore: 18,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
  {
    id: "demo-12",
    busAlias: "8620",
    partName: "Crankcase Filter",
    partNumber: "CV50603",
    priority: "LOW",
    title: "Crankcase Filter — Monitor",
    body: "Bus 8620: Crankcase filter at 63% health. Historically, this bus/part combo has required early replacement — flag for technician inspection at next A service.",
    healthPct: 63,
    tags: ["historically_bad"],
    orderByDate: null,
    projectedFailureKm: 389000,
    urgencyScore: 16,
    snoozedUntil: null,
    dismissed: false,
    createdAt: new Date("2026-03-15"),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED ALERT BAR — cycles through CRITICAL/HIGH notifications
// ─────────────────────────────────────────────────────────────────────────────

function LiveAlertBar({ notifications }: { notifications: PredictiveNotification[] }) {
  const urgent = notifications.filter(n => n.priority === "CRITICAL" || n.priority === "HIGH");
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (urgent.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % urgent.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [urgent.length]);

  if (urgent.length === 0) return null;

  const current = urgent[index % urgent.length]!;
  const isCritical = current.priority === "CRITICAL";

  return (
    <div className={`flex shrink-0 items-center justify-between gap-4 px-6 py-2.5 text-xs font-medium transition-all duration-300 ${
      isCritical ? "bg-red-600" : "bg-amber-500"
    } ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isCritical ? "bg-red-200" : "bg-amber-200"}`} />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isCritical ? "bg-white" : "bg-white"}`} />
        </span>
        <span className="font-bold uppercase tracking-wide text-white">
          {isCritical ? "⚡ Critical Alert" : "⚠ Action Required"}
        </span>
        <span className="text-white/90 truncate">
          Bus <strong>{current.busAlias}</strong> · {current.partName} at{" "}
          <strong>{current.healthPct}% health</strong>
          {current.projectedFailureKm != null && (
            <> · failure @ {current.projectedFailureKm.toLocaleString()} km</>
          )}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {urgent.length > 1 && (
          <span className="text-white/70">
            {(index % urgent.length) + 1} / {urgent.length}
          </span>
        )}
        <button
          onClick={() => setIndex(i => (i + 1) % urgent.length)}
          className="rounded border border-white/30 bg-white/20 px-3 py-1 text-white hover:bg-white/30 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// FLEET SUMMARY BANNER
// ─────────────────────────────────────────────────────────────────────────────

function SummaryBanner({
  notifications,
  data,
}: {
  notifications: PredictiveNotification[];
  data: ReturnType<typeof useFleetPredictive>;
}) {
  const season = currentSeason();
  const critical  = notifications.filter(n => n.priority === "CRITICAL").length;
  const high      = notifications.filter(n => n.priority === "HIGH").length;
  const medium    = notifications.filter(n => n.priority === "MEDIUM").length;
  const orderNow  = notifications.filter(n => n.tags.includes("order_now")).length;
  const seasonal  = notifications.filter(n => n.tags.includes("seasonal_risk") || n.tags.includes("winter_stress")).length;
  const total     = notifications.length;

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
          { label: "Active Alerts",   value: total,    accent: total > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Critical",        value: critical, accent: critical > 0 ? "text-red-600" : "text-stone-800" },
          { label: "High Priority",   value: high,     accent: high > 0 ? "text-amber-600" : "text-stone-800" },
          { label: "Medium Priority", value: medium,   accent: medium > 0 ? "text-blue-600" : "text-stone-800" },
          { label: "Order Now",       value: orderNow, accent: orderNow > 0 ? "text-red-600" : "text-stone-800" },
          { label: "Seasonal Risk",   value: seasonal, accent: seasonal > 0 ? "text-amber-600" : "text-stone-800" },
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CARD
// ─────────────────────────────────────────────────────────────────────────────

function NotifCard({
  n,
  onDismiss,
  onSnooze,
}: {
  n: PredictiveNotification;
  onDismiss: () => void;
  onSnooze: () => void;
}) {
  return (
    <div className={`rounded-xl border border-stone-200 p-4 shadow-sm transition-all ${priorityLeftBorder(n.priority)}`}>
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

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY QUEUE TAB
// ─────────────────────────────────────────────────────────────────────────────

function NotificationQueue({
  notifications,
  onDismiss,
  onSnooze,
}: {
  notifications: PredictiveNotification[];
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
}) {
  const [filter, setFilter] = useState<NotificationPriority | "ALL">("ALL");

  const visible = filter === "ALL"
    ? notifications
    : notifications.filter(n => n.priority === filter);

  const counts: Record<NotificationPriority, number> = {
    CRITICAL: notifications.filter(n => n.priority === "CRITICAL").length,
    HIGH:     notifications.filter(n => n.priority === "HIGH").length,
    MEDIUM:   notifications.filter(n => n.priority === "MEDIUM").length,
    LOW:      notifications.filter(n => n.priority === "LOW").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-stone-500">Filter:</span>
        {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              filter === p
                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
            }`}
          >
            {p}{p !== "ALL" && counts[p] > 0 ? ` (${counts[p]})` : p === "ALL" ? ` (${notifications.length})` : ""}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400">
          {visible.length} notification{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 py-16 text-center">
          <div className="mb-2 text-3xl">✓</div>
          <p className="text-sm font-medium text-stone-500">
            No notifications at {filter} priority
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(n => (
            <NotifCard
              key={n.id}
              n={n}
              onDismiss={() => onDismiss(n.id)}
              onSnooze={() => onSnooze(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLEET HEAT MAP TAB
// ─────────────────────────────────────────────────────────────────────────────

function FleetHeatMap() {
  const buses   = useMemo(() => getMockBuses(), []);
  const records = useMemo(() => getMockPartHealthRecords(), []);

  const partNames = useMemo(() => {
    const freq = new Map<string, number>();
    records.forEach(r => freq.set(r.partName, (freq.get(r.partName) ?? 0) + 1));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [records]);

  const index = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    records.forEach(r => {
      if (!m.has(r.busAlias)) m.set(r.busAlias, new Map());
      m.get(r.busAlias)!.set(r.partName, r.healthPct);
    });
    return m;
  }, [records]);

  const sortedBuses = useMemo(() =>
    [...buses].sort((a, b) => {
      const minA = Math.min(...partNames.map(p => index.get(a.alias)?.get(p) ?? 100));
      const minB = Math.min(...partNames.map(p => index.get(b.alias)?.get(p) ?? 100));
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
                <th key={name} className="px-1.5 py-2.5 text-center text-[10px] font-medium text-stone-400" style={{ minWidth: 52 }}>
                  <span className="block truncate" style={{ maxWidth: 52 }} title={name}>
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
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span className="font-semibold">Legend:</span>
        {[
          { label: "≤20% Critical", cls: "bg-red-500 text-white" },
          { label: "≤35% High",     cls: "bg-orange-400 text-white" },
          { label: "≤55% Medium",   cls: "bg-amber-300 text-stone-800" },
          { label: "≤75% Watch",    cls: "bg-yellow-100 text-stone-700" },
          { label: ">75% Good",     cls: "bg-emerald-100 text-stone-600" },
        ].map(({ label, cls }) => (
          <span key={label} className={`rounded px-2 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEASONAL OUTLOOK TAB
// ─────────────────────────────────────────────────────────────────────────────

function SeasonalOutlook() {
  const CATEGORIES = ["brake", "fluid", "filter", "hvac", "drivetrain", "electrical"] as const;
  const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentMonth = new Date().getMonth();

  function multCell(mult: number) {
    const pct = Math.round((mult - 1) * 100);
    const bg  = mult >= 1.5 ? "bg-red-200 text-red-800 font-bold"
              : mult >= 1.3 ? "bg-amber-200 text-amber-800 font-bold"
              : mult >= 1.1 ? "bg-yellow-100 text-yellow-700"
              : "text-stone-400";
    return { bg, label: pct > 0 ? `+${pct}%` : "–" };
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">Seasonal Wear Multipliers</h2>
        <span className="text-xs text-stone-400">Current month highlighted · values show how much faster parts degrade</span>
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
                    i === currentMonth ? "bg-teal-700 text-white" : "text-stone-400"
                  }`}
                  style={{ minWidth: 44 }}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, ci) => (
              <tr key={cat} className={ci % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                <td className="px-4 py-2.5 font-semibold capitalize text-stone-700">{cat}</td>
                {SEASONAL_MULTIPLIERS[cat].map((mult, mi) => {
                  const { bg, label } = multCell(mult);
                  return (
                    <td
                      key={mi}
                      className={`px-1.5 py-2.5 text-center tabular-nums ${bg} ${mi === currentMonth ? "ring-2 ring-inset ring-teal-600" : ""}`}
                    >
                      {label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500 space-y-1">
        <p>
          <span className="font-semibold text-stone-700">How to read this:</span>{" "}
          A value of +50% means the part degrades 50% faster than baseline that month.
          The algorithm divides <code className="bg-stone-100 px-1 rounded">expectedLifeKm</code> by the multiplier to shorten adjusted life.
        </p>
        <p>
          <span className="font-semibold text-stone-700">March 2026 context:</span>{" "}
          Brake wear still elevated at +30% from road salt. HVAC transitioning off peak winter load (+20%). Most categories returning to baseline by April.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type DashView = "notifications" | "heatmap" | "seasonal";

const VIEWS: { id: DashView; label: string; icon: string }[] = [
  { id: "notifications", label: "Priority Queue",   icon: "🔔" },
  { id: "heatmap",       label: "Fleet Heat Map",   icon: "🌡" },
  { id: "seasonal",      label: "Seasonal Outlook", icon: "❄️" },
];

export default function PredictiveDashboard() {
  const predictive = useFleetPredictive();
  const [view, setView] = useState<DashView>("notifications");

  // Demo notification state — dismissible/snoozeable from the UI
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [snoozed,   setSnoozed]   = useState<Set<string>>(new Set());

  const activeNotifications = DEMO_NOTIFICATIONS.filter(
    n => !dismissed.has(n.id) && !snoozed.has(n.id)
  );

  const urgentTotal = activeNotifications.filter(
    n => n.priority === "CRITICAL" || n.priority === "HIGH"
  ).length;

  function handleDismiss(id: string) {
    setDismissed(prev => new Set(prev).add(id));
  }

  function handleSnooze(id: string) {
    setSnoozed(prev => new Set(prev).add(id));
  }

  function handleReset() {
    setDismissed(new Set());
    setSnoozed(new Set());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4efe6] to-[#fff9f0] p-4 sm:p-8">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/90 shadow-xl shadow-stone-200/60 backdrop-blur-sm">

          {/* Page header */}
          <header className="border-b border-stone-200 bg-[repeating-linear-gradient(-45deg,rgba(255,180,73,0.09),rgba(255,180,73,0.09)_14px,rgba(255,255,255,0.65)_14px,rgba(255,255,255,0.65)_28px)] px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-stone-800">
                    🔮 Predictive Parts Dashboard
                  </h1>
                  {urgentTotal > 0 && (
                    <span className="animate-pulse rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      {urgentTotal} urgent
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-stone-500">
                  AI-driven part health · predictive ordering · seasonal degradation modelling
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset demo button */}
                {(dismissed.size > 0 || snoozed.size > 0) && (
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    ↺ Reset Demo
                  </button>
                )}

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
            </div>
          </header>

          {/* Animated alert bar */}
          <LiveAlertBar notifications={activeNotifications} />

          {/* Content */}
          <div className="space-y-8 p-6">
            <SummaryBanner notifications={activeNotifications} data={predictive} />

            {view === "notifications" && (
              <NotificationQueue
                notifications={activeNotifications}
                onDismiss={handleDismiss}
                onSnooze={handleSnooze}
              />
            )}
            {view === "heatmap"   && <FleetHeatMap />}
            {view === "seasonal"  && <SeasonalOutlook />}
          </div>
        </div>
      </div>
    </div>
  );
}
