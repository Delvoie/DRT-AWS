// src/components/AssetDrawer.tsx
// Slide-out drawer showing full detail for a selected bus asset.
// Opens from the right, traps focus, closes on Escape or backdrop click.

"use client";

import { useEffect, useRef } from "react";
import type { BusRiskDetails } from "@/lib/types/";
import { DataFreshness, RiskLevel } from "@/lib/types/";
import { RiskBadge } from "./RiskBadge";

interface Props {
  asset: BusRiskDetails | null;
  onClose: () => void;
}

function formatKm(n: number) {
  return `${n.toLocaleString()} km`;
}

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  const d = date instanceof Date ? date : new Date(date as unknown as string);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toISOString().slice(0, 16).replace("T", " ");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-stone-50 px-3 py-2">
      <span className="text-xs text-stone-500">{label}</span>
      <span className={`text-right text-xs font-medium text-stone-800 ${accent ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

function RiskMeter({ ratio, level }: { ratio: number; level: RiskLevel }) {
  const pct = Math.min(100, Math.round(ratio * 100));
  const fill =
    level === RiskLevel.CRITICAL
      ? "bg-red-500"
      : level === RiskLevel.WARNING
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[0.68rem] text-stone-400">
        <span>0%</span>
        <span className="font-semibold text-stone-600">{pct}% of tolerance used</span>
        <span>100%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {ratio > 1 && (
        <p className="text-[0.68rem] font-semibold text-red-600">
          ⚠ {Math.round((ratio - 1) * 100)}% over tolerance
        </p>
      )}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export function AssetDrawer({ asset, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (asset) {
      document.addEventListener("keydown", onKeyDown);
      // Focus the close button when drawer opens
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [asset, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (asset) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [asset]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          asset ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={asset ? `Asset detail for bus ${asset.busNumber}` : "Asset detail"}
        className={`
          fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col
          border-l border-stone-200 bg-[#fffdf7] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${asset ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {asset && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 bg-[repeating-linear-gradient(-45deg,rgba(255,180,73,0.07),rgba(255,180,73,0.07)_10px,transparent_10px,transparent_20px)] px-5 py-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                  Bus Asset
                </p>
                <h2 className="mt-0.5 font-mono text-2xl font-bold text-stone-800">
                  {asset.busNumber}
                </h2>
                <p className="mt-1 text-sm text-stone-500">{asset.assetDescription}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RiskBadge level={asset.riskLevel} label={asset.riskLabel} />
                  {asset.dataFreshness !== DataFreshness.CURRENT && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[0.68rem] font-medium text-amber-700">
                      Data {asset.dataFreshness.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close detail panel"
                className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

              {/* Risk meter */}
              <Section title="Risk gauge">
                <RiskMeter ratio={asset.riskRatio} level={asset.riskLevel} />
              </Section>

              {/* Odometer & service */}
              <Section title="Service window">
                <Field label="Current odometer"    value={formatKm(asset.odometerKm)} />
                <Field label="Next service trigger" value={formatKm(asset.nextServiceKm)} />
                <Field label="Km to next service"   value={formatKm(asset.kmToNextService)}
                  accent={asset.kmToNextService < 0 ? "text-red-600" : asset.kmToNextService < asset.toleranceKm ? "text-amber-600" : "text-emerald-700"} />
                <Field label="Tolerance"            value={formatKm(asset.toleranceKm)} />
              </Section>

              {/* Lateness */}
              <Section title="Overdue status">
                <Field
                  label="Units late"
                  value={formatKm(asset.unitsLate)}
                  accent={asset.unitsLate > 0 ? "text-red-600" : "text-emerald-700"}
                />
                {asset.unitsLateDelta !== null && (
                  <Field
                    label="Units late delta (vs prev)"
                    value={(asset.unitsLateDelta >= 0 ? "+" : "") + formatKm(asset.unitsLateDelta)}
                    accent={asset.unitsLateDelta > 0 ? "text-amber-600" : "text-emerald-700"}
                  />
                )}
                <Field
                  label="Days overdue"
                  value={asset.daysOverdue > 0 ? `${asset.daysOverdue} days` : "On time"}
                  accent={asset.daysOverdue > 0 ? "text-red-600" : "text-emerald-700"}
                />
                {asset.daysLateDelta !== null && (
                  <Field
                    label="Days late delta (vs prev)"
                    value={(asset.daysLateDelta >= 0 ? "+" : "") + `${asset.daysLateDelta}d`}
                    accent={asset.daysLateDelta > 0 ? "text-amber-600" : "text-emerald-700"}
                  />
                )}
                <Field label="Over tolerance by" value={formatKm(asset.overToleranceByKm)}
                  accent={asset.overToleranceByKm > 0 ? "text-red-600" : undefined} />
              </Section>

              {/* Asset info */}
              <Section title="Asset information">
                <Field label="Type"          value={asset.assetType === "CONVENTIONAL_BUS" ? "Conventional bus" : "Non-conventional"} />
                <Field label="Location"      value={asset.location} />
                <Field label="Asset status"  value={asset.assetStatus} />
                {asset.yearBuilt != null && (
                  <Field label="Year built"  value={`${asset.yearBuilt} (${asset.ageYears ?? 0} yrs old)`} />
                )}
                <Field label="Report date"   value={formatDate(asset.reportDate)} />
              </Section>

              {/* Job plans */}
              <Section title="Job plans">
                <div className="rounded-lg bg-stone-50 px-3 py-2">
                  <p className="mb-1 text-[0.68rem] text-stone-400">Current</p>
                  <p className="text-xs font-medium text-stone-800">{asset.currentJobPlan || "—"}</p>
                </div>
                <div className="rounded-lg bg-stone-50 px-3 py-2">
                  <p className="mb-1 text-[0.68rem] text-stone-400">Scheduled</p>
                  <p className="text-xs font-medium text-stone-800">{asset.nextJobPlan || "—"}</p>
                </div>
              </Section>

              {/* Risk factors */}
              {asset.riskFactors.length > 0 && (
                <Section title="Risk factors">
                  <ul className="space-y-1.5">
                    {asset.riskFactors.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 rounded-lg bg-amber-50/80 px-3 py-2 text-xs text-stone-700"
                      >
                        <span className="mt-0.5 text-amber-500">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Data gaps */}
              {asset.dataGaps.length > 0 && (
                <Section title="Data quality gaps">
                  <ul className="space-y-1.5">
                    {asset.dataGaps.map((g) => (
                      <li
                        key={g}
                        className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                      >
                        <span className="mt-0.5">⚠</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
