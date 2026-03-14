// src/components/RiskBadge.tsx
// Pill badge for CRITICAL / WARNING / STABLE risk levels.

import type { RiskLevel } from "@/lib/types";

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
  size?: "sm" | "md";
}

const STYLES: Record<RiskLevel, string> = {
  CRITICAL: "bg-red-600   border-red-700   text-white",
  WARNING:  "bg-amber-600 border-amber-700 text-white",
  STABLE:   "bg-emerald-700 border-emerald-800 text-white",
};

export function RiskBadge({ level, label, size = "md" }: RiskBadgeProps) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[0.68rem]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold tracking-wide ${padding} ${STYLES[level]}`}
    >
      {level}
      {label && (
        <span className="ml-1.5 font-normal opacity-90">{label}</span>
      )}
    </span>
  );
}
