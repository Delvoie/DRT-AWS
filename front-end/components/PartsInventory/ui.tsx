// src/components/ui.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared primitive components used across the dashboard.
// Industrial/utilitarian aesthetic — dense data, clear hierarchy.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { RiskLevel, MaintenanceStatus, ServiceLevel } from "@/lib/types";

// ── Risk badge ────────────────────────────────────────────────────────────────

const RISK_STYLES: Record<RiskLevel, string> = {
  [RiskLevel.Critical]: "bg-red-600 text-white border-red-700",
  [RiskLevel.Warning]:  "bg-amber-500 text-white border-amber-600",
  [RiskLevel.Stable]:   "bg-emerald-600 text-white border-emerald-700",
};

export function RiskBadge({ level, size = "sm" }: { level: RiskLevel; size?: "xs" | "sm" | "md" }) {
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center rounded border font-bold tracking-wide uppercase ${pad} ${RISK_STYLES[level]}`}>
      {level}
    </span>
  );
}

// ── Service level badge ───────────────────────────────────────────────────────

const SVC_STYLES: Record<ServiceLevel, string> = {
  [ServiceLevel.A]: "bg-sky-100 text-sky-800 border-sky-300",
  [ServiceLevel.B]: "bg-violet-100 text-violet-800 border-violet-300",
  [ServiceLevel.C]: "bg-orange-100 text-orange-800 border-orange-300",
  [ServiceLevel.D]: "bg-rose-100 text-rose-800 border-rose-300",
};

export function ServiceBadge({ level }: { level: ServiceLevel }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold ${SVC_STYLES[level]}`}>
      {level} SVC
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.Pending]:    "bg-stone-100 text-stone-600 border-stone-300",
  [MaintenanceStatus.InProgress]: "bg-blue-100 text-blue-700 border-blue-300",
  [MaintenanceStatus.Complete]:   "bg-green-100 text-green-800 border-green-300",
  [MaintenanceStatus.Overdue]:    "bg-red-100 text-red-700 border-red-300",
  [MaintenanceStatus.Cancelled]:  "bg-stone-200 text-stone-500 border-stone-300 line-through",
};

export function StatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

export function KpiCard({
  label, value, sub, accent = "neutral",
}: {
  label: string; value: string | number; sub?: string;
  accent?: "critical" | "warning" | "stable" | "neutral";
}) {
  const accent_color = {
    critical: "text-red-600",
    warning:  "text-amber-600",
    stable:   "text-emerald-700",
    neutral:  "text-stone-800",
  }[accent];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
      <p className={`mt-1 text-3xl font-black ${accent_color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-stone-400">{sub}</p>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
      <div>
        <h2 className="text-base font-bold text-stone-800">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-stone-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Odometer progress bar ─────────────────────────────────────────────────────

export function OdometerBar({ kmToNext, frequency, unitsLate }: { kmToNext: number; frequency: number; unitsLate: number }) {
  const isLate = unitsLate > 0;
  const pct = isLate
    ? Math.min(100, (unitsLate / frequency) * 100)
    : Math.max(0, 100 - (kmToNext / frequency) * 100);

  const fillColor = unitsLate > 1000 ? "bg-red-500" : unitsLate > 500 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-stone-400">
        <span>{isLate ? `${unitsLate.toLocaleString()} km overdue` : `${kmToNext.toLocaleString()} km remaining`}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${fillColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-stone-400">
      <div className="mb-3 text-4xl opacity-30">🚌</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-stone-100 ${className}`} />;
}

// ── Form field wrapper ────────────────────────────────────────────────────────

export function Field({
  label, error, required, children,
}: {
  label: string; error?: string | undefined ; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-stone-600">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Input / Select / Textarea ─────────────────────────────────────────────────

const inputBase = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} min-h-[80px] resize-y ${props.className ?? ""}`} />;
}

// ── Button ────────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";

const BTN_STYLES: Record<BtnVariant, string> = {
  primary:   "bg-teal-700 text-white border-teal-800 hover:bg-teal-800",
  secondary: "bg-white text-stone-700 border-stone-300 hover:bg-stone-50",
  danger:    "bg-red-600 text-white border-red-700 hover:bg-red-700",
  ghost:     "bg-transparent text-stone-600 border-transparent hover:bg-stone-100",
};

export function Button({
  variant = "secondary", className = "", children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${BTN_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Autofill warning banner ───────────────────────────────────────────────────

export function AutofillWarningBanner({
  warnings,
  onDismiss,
}: {
  warnings: import("@/lib/types").AutofillOverride[];
  onDismiss: (field: import("@/lib/types").AutofillOverride["field"]) => void;
}) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
      <p className="mb-2 text-xs font-semibold text-amber-800">
        ⚠ Auto-fill overrode existing values — review before saving:
      </p>
      <ul className="space-y-1">
        {warnings.map(w => (
          <li key={w.field} className="flex items-center justify-between gap-2 text-xs text-amber-700">
            <span>
              <strong>{w.field}</strong>: <s className="opacity-60">{w.previousValue}</s> → <strong>{w.newValue}</strong>
            </span>
            <button onClick={() => onDismiss(w.field)} className="text-amber-500 hover:text-amber-700">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
