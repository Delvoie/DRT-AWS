// src/hooks/useFleetFilters.ts
// Manages search + risk-level filter state and returns filtered assets.

"use client";

import { useMemo, useState } from "react";
import type { BusRiskDetails, FilterState, RiskFilterValue } from "@/lib/types";
import { RiskLevel } from "@/lib/types";

interface UseFleetFiltersResult {
  filters: FilterState;
  setQuery: (q: string) => void;
  setRiskLevel: (level: RiskFilterValue) => void;
  filtered: readonly BusRiskDetails[];
}

export function useFleetFilters(
  assets: readonly BusRiskDetails[]
): UseFleetFiltersResult {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    riskLevel: "ALL",
  });

  const filtered = useMemo(() => {
    const query = filters.query.toLowerCase().trim();

    return assets.filter((asset) => {
      if (filters.riskLevel !== "ALL" && asset.riskLevel !== filters.riskLevel) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        asset.busNumber,
        asset.assetDescription,
        asset.location,
        asset.assetStatus,
        asset.riskLevel,
        asset.currentJobPlan,
        asset.nextJobPlan,
        ...asset.riskFactors,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assets, filters]);

  return {
    filters,
    setQuery: (q) => setFilters((f) => ({ ...f, query: q })),
    setRiskLevel: (level) => setFilters((f) => ({ ...f, riskLevel: level })),
    filtered,
  };
}

export const RISK_FILTER_OPTIONS: { value: RiskFilterValue; label: string }[] = [
  { value: "ALL", label: "All Risk Levels" },
  { value: RiskLevel.Critical, label: "Critical" },
  { value: RiskLevel.Warning, label: "Warning" },
  { value: RiskLevel.Stable, label: "Stable" },
];
