// src/components/bus/BusList.tsx
"use client";

import { GarageLocation, RiskLevel, ServiceLevel, type BusRecord } from "@/lib/types";
import { RiskBadge, ServiceBadge, OdometerBar, Skeleton, EmptyState } from "@/components/PartsInventory/ui";
import type { UseBusListResult } from "@/hooks/useBusDashboard";

interface Props {
  listData:      UseBusListResult;
  selectedAlias: string | null;
  onSelect:      (alias: string) => void;
}

const RISK_OPTIONS: { value: RiskLevel | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Risk" },
  { value: RiskLevel.Critical, label: "Critical" },
  { value: RiskLevel.Warning,  label: "Warning"  },
  { value: RiskLevel.Stable,   label: "Stable"   },
];

const LOCATION_OPTIONS: { value: GarageLocation | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Garages" },
  ...Object.values(GarageLocation).map(g => ({ value: g, label: g })),
];

const SVC_OPTIONS: { value: ServiceLevel | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Services" },
  ...Object.values(ServiceLevel).map(s => ({ value: s, label: `Service ${s}` })),
];

export function BusList({ listData, selectedAlias, onSelect }: Props) {
  const { filtered, filters, setSearch, setRiskFilter, setLocationFilter, setServiceFilter, isLoading } = listData;

  return (
    <div className="flex h-full flex-col border-r border-stone-200 bg-[#fafaf8]">
      {/* Search + filters */}
      <div className="space-y-2 border-b border-stone-200 p-3">
        <input
          type="search"
          value={filters.search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bus ID, model…"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
        <div className="grid grid-cols-3 gap-1.5">
          <select
            value={filters.riskLevel}
            onChange={e => setRiskFilter(e.target.value as RiskLevel | "ALL")}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700 focus:outline-none"
          >
            {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.location}
            onChange={e => setLocationFilter(e.target.value as GarageLocation | "ALL")}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700 focus:outline-none"
          >
            {LOCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.serviceLevel}
            onChange={e => setServiceFilter(e.target.value as ServiceLevel | "ALL")}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700 focus:outline-none"
          >
            {SVC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <p className="text-[10px] text-stone-400">{filtered.length} buses</p>
      </div>

      {/* Bus list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No buses match your filters." />
        ) : (
          <ul>
            {filtered.map(bus => (
              <BusListItem
                key={bus.alias}
                bus={bus}
                selected={bus.alias === selectedAlias}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BusListItem({ bus, selected, onSelect }: { bus: BusRecord; selected: boolean; onSelect: (a: string) => void }) {
  return (
    <li>
      <button
        onClick={() => onSelect(bus.alias)}
        className={`w-full border-b border-stone-100 px-3 py-3 text-left transition-colors hover:bg-amber-50/60
          ${selected ? "border-l-2 border-l-teal-600 bg-teal-50/40" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-stone-800">
                {bus.alias}
              </span>
              <ServiceBadge level={bus.currentServiceLevel} />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-stone-500">{bus.location}</p>
          </div>
          <RiskBadge level={bus.riskLevel} size="xs" />
        </div>
        <div className="mt-2">
          <OdometerBar
            kmToNext={bus.pm.kmToNext}
            frequency={bus.pm.frequency}
            unitsLate={bus.pm.unitsLate}
          />
        </div>
      </button>
    </li>
  );
}
