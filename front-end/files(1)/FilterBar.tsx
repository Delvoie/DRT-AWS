// src/components/FilterBar.tsx
// Search input + risk-level select. Fully controlled — state lives in the parent.

"use client";

import type { RiskFilterValue } from "@/lib/types";
import { RISK_FILTER_OPTIONS } from "@/hooks/useFleetFilters";

interface Props {
  query: string;
  riskLevel: RiskFilterValue;
  onQueryChange: (q: string) => void;
  onRiskLevelChange: (level: RiskFilterValue) => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  query,
  riskLevel,
  onQueryChange,
  onRiskLevelChange,
  resultCount,
  totalCount,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search by bus, model, garage, job plan, or risk factor…"
        aria-label="Search assets"
        className="
          flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5
          text-sm text-stone-800 placeholder-stone-400
          focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20
        "
      />

      <select
        value={riskLevel}
        onChange={(e) => onRiskLevelChange(e.target.value as RiskFilterValue)}
        aria-label="Filter by risk level"
        className="
          rounded-xl border border-stone-300 bg-white px-4 py-2.5
          text-sm text-stone-800
          focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20
          sm:w-48
        "
      >
        {RISK_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <p className="text-xs text-stone-400 sm:whitespace-nowrap">
        {resultCount} of {totalCount} assets
      </p>
    </div>
  );
}
