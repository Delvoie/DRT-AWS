// src/components/DepotBreakdown.tsx
// Visual per-depot risk breakdown: stacked bar showing critical / warning / stable counts.
// Pure CSS — no charting library dependency.

import type { DepotRiskSummary } from "@/lib/types";
import { RiskLevel } from "@/lib/types";

interface Props {
  depots: readonly DepotRiskSummary[];
}

interface BarSegmentProps {
  count: number;
  total: number;
  level: RiskLevel;
}

const SEGMENT_STYLES: Record<RiskLevel, { bg: string; label: string }> = {
  [RiskLevel.CRITICAL]: { bg: "bg-red-500",    label: "Critical" },
  [RiskLevel.WARNING]:  { bg: "bg-amber-400",  label: "Warning"  },
  [RiskLevel.STABLE]:   { bg: "bg-emerald-500", label: "Stable"  },
};

function BarSegment({ count, total, level }: BarSegmentProps) {
  if (count === 0 || total === 0) return null;
  const pct = (count / total) * 100;
  const { bg } = SEGMENT_STYLES[level];

  return (
    <div
      className={`${bg} flex items-center justify-center text-[0.6rem] font-bold text-white transition-all`}
      style={{ width: `${pct}%` }}
      title={`${SEGMENT_STYLES[level].label}: ${count}`}
    >
      {pct > 8 ? count : ""}
    </div>
  );
}

function DepotRow({ depot }: { depot: DepotRiskSummary }) {
  const total = depot.totalAssets;
  const critPct = total > 0 ? Math.round((depot.critical / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-700">{depot.location}</span>
        <span className="text-[0.68rem] text-stone-400">
          {total} asset{total !== 1 ? "s" : ""} · avg {depot.avgDaysOverdue}d overdue
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-lg bg-stone-100">
        <BarSegment count={depot.critical} total={total} level={RiskLevel.CRITICAL} />
        <BarSegment count={depot.warning}  total={total} level={RiskLevel.WARNING}  />
        <BarSegment count={depot.stable}   total={total} level={RiskLevel.STABLE}   />
      </div>

      {/* Legend pills */}
      <div className="flex gap-3 text-[0.65rem] text-stone-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {depot.critical} critical
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {depot.warning} warning
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {depot.stable} stable
        </span>
        {critPct > 0 && (
          <span className="ml-auto font-semibold text-red-600">{critPct}% critical rate</span>
        )}
      </div>
    </div>
  );
}

export function DepotBreakdown({ depots }: Props) {
  if (depots.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
        Depot breakdown
      </h2>
      <div className="space-y-5">
        {depots.map((depot) => (
          <DepotRow key={depot.location} depot={depot} />
        ))}
      </div>
    </div>
  );
}
