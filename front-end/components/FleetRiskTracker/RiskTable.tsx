// src/components/RiskTable.tsx
// Sortable, scrollable risk table. Columns: asset, risk, status, location,
// units late, days late, odometer/trigger, tolerance, report date, job plan.

"use client";

import { useCallback, useState } from "react";
import type { BusRiskDetails } from "@/lib/types";
import { RiskLevel } from "@/lib/types";
import { AssetRow } from "./AssetRow";

type SortKey = keyof Pick<
  BusRiskDetails,
  | "busNumber"
  | "riskLevel"
  | "unitsLate"
  | "daysOverdue"
  | "odometerKm"
  | "riskRatio"
  | "location"
>;

type SortDir = "asc" | "desc";

interface ColDef {
  key: SortKey | null;
  label: string;
  className?: string;
}

const COLUMNS: ColDef[] = [
  { key: "busNumber",   label: "Asset" },
  { key: "riskLevel",   label: "Risk" },
  { key: null,          label: "Status" },
  { key: "location",    label: "Location" },
  { key: "unitsLate",   label: "Units Late",         className: "text-right" },
  { key: "daysOverdue", label: "Days Late",           className: "text-right" },
  { key: "odometerKm",  label: "Odometer / Trigger",  className: "text-right" },
  { key: "riskRatio",   label: "Tolerance",           className: "text-right" },
  { key: null,          label: "Report Date" },
  { key: null,          label: "Job Plan / Factors" },
];

function riskRank(level: RiskLevel): number {
  switch (level) {
    case RiskLevel.Critical: return 3;
    case RiskLevel.Warning:  return 2;
    case RiskLevel.Stable:   return 1;
  }
}

function sortAssets(
  assets: readonly BusRiskDetails[],
  key: SortKey,
  dir: SortDir
): BusRiskDetails[] {
  return [...assets].sort((a, b) => {
    let diff: number;

    if (key === "riskLevel") {
      diff = riskRank(b.riskLevel) - riskRank(a.riskLevel);
    } else if (key === "busNumber" || key === "location") {
      diff = a[key].localeCompare(b[key]);
    } else {
      diff = (a[key] as number) - (b[key] as number);
    }

    return dir === "asc" ? diff : -diff;
  });
}

interface Props {
  assets: readonly BusRiskDetails[];
  onSelect?: (asset: BusRiskDetails) => void;
}

export function RiskTable({ assets, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("riskLevel");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = useCallback(
    (key: SortKey | null) => {
      if (!key) return;
      setSortDir((prev) => (sortKey === key && prev === "desc" ? "asc" : "desc"));
      setSortKey(key);
    },
    [sortKey]
  );

  const sorted = sortAssets(assets, sortKey, sortDir);

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
      <table className="w-full min-w-[1020px] border-collapse text-left">
        <thead>
          <tr className="bg-[#f4e7d5]">
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                onClick={() => handleSort(col.key)}
                className={`
                  sticky top-0 z-10 border-b border-stone-300 px-4 py-3
                  text-[0.74rem] font-semibold uppercase tracking-wider text-stone-500
                  ${col.key ? "cursor-pointer select-none hover:text-stone-800" : ""}
                  ${col.className ?? ""}
                `}
              >
                {col.label}
                {col.key && sortKey === col.key && (
                  <span className="ml-1 opacity-50">{sortDir === "desc" ? "↓" : "↑"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="py-12 text-center text-sm text-stone-400"
              >
                No assets match your filters.
              </td>
            </tr>
          ) : (
            sorted.map((asset, i) => (
              <AssetRow
                key={asset.busNumber}
                asset={asset}
                index={i}
                {...(onSelect ? { onSelect } : {})}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
