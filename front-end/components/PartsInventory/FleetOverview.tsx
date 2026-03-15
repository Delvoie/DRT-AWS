// src/components/bus/FleetOverview.tsx
"use client";

import { GarageLocation } from "@/lib/types";
import { KpiCard } from "@/components/PartsInventory/ui";
import type { UseBusListResult } from "@/hooks/useBusDashboard";

export function FleetOverview({ listData }: { listData: UseBusListResult }) {
  const { summary, isLoading } = listData;
  if (isLoading) return null;

  return (
    <div className="border-b border-stone-200 bg-white px-6 py-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard label="Total Buses"   value={summary.total} />
        <KpiCard label="Critical"      value={summary.critical}  accent="critical" />
        <KpiCard label="Warning"       value={summary.warning}   accent="warning"  />
        <KpiCard label="Stable"        value={summary.stable}    accent="stable"   />
        <KpiCard label="Overdue"       value={summary.overdueCount} sub="past tolerance" accent={summary.overdueCount > 0 ? "critical" : "stable"} />
        <KpiCard label="Raleigh"       value={summary.byGarage[GarageLocation.Raleigh]} sub="Garage" />
        <KpiCard label="Westney"       value={summary.byGarage[GarageLocation.Westney]} sub="Garage" />
      </div>
    </div>
  );
}
