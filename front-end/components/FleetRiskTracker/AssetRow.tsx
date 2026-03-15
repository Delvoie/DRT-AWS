// src/components/AssetRow.tsx
// Single <tr> for the risk table. Broken out for readability + memo-ability.

import { memo } from "react";
import type { BusRiskDetails } from "@/lib/types";
import { DataFreshness, RiskLevel } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

interface Props {
  asset: BusRiskDetails;
  index: number;
  onSelect?: (asset: BusRiskDetails) => void;
}

function formatKm(n: number): string {
  return `${n.toLocaleString()} km`;
}

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  // Date arrives as a plain string after JSON serialisation — re-parse it
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toISOString().slice(0, 16).replace("T", " ");
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "—";
  return (delta >= 0 ? "+" : "") + delta.toLocaleString();
}

const ROW_BG: Record<RiskLevel, string> = {
  [RiskLevel.Critical]: "bg-red-50/60",
  [RiskLevel.Warning]:  "bg-amber-50/50",
  [RiskLevel.Stable]:   "",
};

export const AssetRow = memo(function AssetRow({ asset, index, onSelect }: Props) {
  const animDelay = `${(index * 0.012).toFixed(3)}s`;
  const isFresh = asset.dataFreshness === DataFreshness.CURRENT;

  return (
    <tr
      className={`border-b border-stone-100 transition-colors hover:bg-amber-50/40 ${ROW_BG[asset.riskLevel]} ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(asset)}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(asset)}
      style={{ animationDelay: animDelay }}
    >
      {/* Asset */}
      <td className="px-4 py-3 align-top">
        <p className="font-mono text-sm font-bold text-stone-800">{asset.busNumber}</p>
        <p className="mt-0.5 text-xs text-stone-500">{asset.assetDescription}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Chip>{asset.assetType === "CONVENTIONAL_BUS" ? "Conventional" : "Non-conventional"}</Chip>
          {asset.yearBuilt != null && (
            <Chip>{asset.yearBuilt} · {asset.ageYears ?? 0}yr</Chip>
          )}
        </div>
      </td>

      {/* Risk */}
      <td className="px-4 py-3 align-top">
        <RiskBadge level={asset.riskLevel} />
        <p className="mt-1 text-xs text-stone-500">{asset.riskLabel}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-top">
        <StatusDot status={asset.assetStatus} />
      </td>

      {/* Location */}
      <td className="px-4 py-3 align-top text-sm text-stone-600">{asset.location}</td>

      {/* Units late + delta */}
      <td className="px-4 py-3 align-top font-mono text-sm">
        <span className={asset.unitsLate > 0 ? "text-red-600 font-semibold" : "text-stone-500"}>
          {formatKm(asset.unitsLate)}
        </span>
        <p className="mt-0.5 text-xs text-stone-400">Δ {formatDelta(asset.unitsLateDelta)}</p>
      </td>

      {/* Days late */}
      <td className="px-4 py-3 align-top font-mono text-sm">
        <span className={asset.daysOverdue > 0 ? "text-red-600 font-semibold" : "text-stone-400"}>
          {asset.daysOverdue > 0 ? `${asset.daysOverdue}d` : "—"}
        </span>
        {asset.daysLateDelta !== null && (
          <p className="mt-0.5 text-xs text-stone-400">Δ {formatDelta(asset.daysLateDelta)}d</p>
        )}
      </td>

      {/* Odometer / next trigger */}
      <td className="px-4 py-3 align-top font-mono text-xs text-stone-600">
        <p>{formatKm(asset.odometerKm)}</p>
        <p className="text-stone-400">→ {formatKm(asset.nextServiceKm)}</p>
        <KmProgressBar kmToGo={asset.kmToNextService} tolerance={asset.toleranceKm} />
      </td>

      {/* Tolerance / ratio */}
      <td className="px-4 py-3 align-top font-mono text-xs text-stone-600">
        <p>{formatKm(asset.toleranceKm)}</p>
        <p className="text-stone-400">ratio {asset.riskRatio.toFixed(2)}</p>
      </td>

      {/* Report date */}
      <td className="px-4 py-3 align-top font-mono text-xs text-stone-600">
        <p>{formatDate(asset.reportDate)}</p>
        {!isFresh && (
          <Chip variant="warn">{asset.dataFreshness.toLowerCase()}</Chip>
        )}
      </td>

      {/* Job plan + risk factors */}
      <td className="px-4 py-3 align-top">
        <p className="text-xs font-medium text-stone-700">{asset.currentJobPlan || "—"}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {asset.riskFactors.map((f) => (
            <Chip key={f}>{f}</Chip>
          ))}
        </div>
      </td>
    </tr>
  );
});

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "warn" }) {
  const cls =
    variant === "warn"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-stone-200 bg-amber-50/80 text-stone-600";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] ${cls}`}>
      {children}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "DOWN"
      ? "bg-red-500"
      : status === "OPERATING" || status === "ACTIVE"
      ? "bg-emerald-500"
      : "bg-stone-400";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {status}
    </span>
  );
}

function KmProgressBar({ kmToGo, tolerance }: { kmToGo: number; tolerance: number }) {
  if (tolerance <= 0) return null;
  const pct = Math.max(0, Math.min(100, (kmToGo / (tolerance * 10)) * 100));
  const fill =
    kmToGo < 0
      ? "bg-red-500"
      : kmToGo < tolerance
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-stone-200">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
