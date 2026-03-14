// src/components/FleetSummaryCards.tsx
// Top-level KPI cards: total assets, critical, warning, overdue %, plus per-depot breakdown.

import type { BusRiskReport } from "@/lib/types";

interface Props {
  report: BusRiskReport;
}

interface StatCardProps {
  title: string;
  value: string;
  accent?: "critical" | "warning" | "stable" | "neutral";
  sub?: string;
}

function StatCard({ title, value, accent = "neutral", sub }: StatCardProps) {
  const accentColor = {
    critical: "text-red-600",
    warning:  "text-amber-600",
    stable:   "text-emerald-700",
    neutral:  "text-stone-800",
  }[accent];

  return (
    <article className="rounded-2xl border border-stone-200 bg-[#fffdf7] p-4 shadow-sm">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-widest text-stone-500">
        {title}
      </h3>
      <p className={`mt-2 text-3xl font-bold ${accentColor}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-400">{sub}</p>}
    </article>
  );
}

export function FleetSummaryCards({ report }: Props) {
  const { fleet, depots } = report;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <StatCard title="Total Assets"  value={String(fleet.totalAssets)} />
      <StatCard title="Critical"      value={String(fleet.critical)}     accent="critical" />
      <StatCard title="Warning"       value={String(fleet.warning)}      accent="warning"  />
      <StatCard title="Overdue %"     value={`${fleet.overduePercent.toFixed(1)}%`} accent="stable" />

      {depots.map((depot) => (
        <StatCard
          key={depot.location}
          title={depot.location}
          value={`${depot.critical}C · ${depot.warning}W · ${depot.stable}S`}
          sub={`avg ${depot.avgDaysOverdue}d overdue`}
        />
      ))}
    </div>
  );
}
