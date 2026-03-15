// components/Predictive/PredictiveAlertBanner.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A slim banner rendered at the top of the PartsInventory page whenever
// there are critical or high-priority predictive notifications active.
// Disappears when all parts are healthy. Links to the full dashboard.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePredictiveAlerts } from "@/hooks/usePredictive";

export function PredictiveAlertBanner() {
  const { criticalCount, orderNowCount, hasCritical } = usePredictiveAlerts();

  // Nothing to show
  if (criticalCount === 0 && orderNowCount === 0) return null;

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs font-medium ${
        hasCritical
          ? "bg-red-600 text-white"
          : "bg-amber-500 text-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold uppercase tracking-wide">
          {hasCritical ? "⚡ Predictive Alert" : "⚠ Parts Warning"}
        </span>
        {criticalCount > 0 && (
          <span>
            <strong>{criticalCount}</strong> part{criticalCount !== 1 ? "s" : ""} at critical health
          </span>
        )}
        {orderNowCount > 0 && (
          <span>
            <strong>{orderNowCount}</strong> part{orderNowCount !== 1 ? "s" : ""} need ordering now
          </span>
        )}
      </div>
      <Link
        href="/predictive"
        className="rounded border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
      >
        View Predictive Dashboard →
      </Link>
    </div>
  );
}
