// components/Predictive/PartHealthBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Animated health bar for a single part.
// Colour: green > 60 | amber 35–60 | red 20–35 | dark red ≤ 20
// ─────────────────────────────────────────────────────────────────────────────
"use client";

interface Props {
  healthPct:  number;
  label?:     string;
  showPct?:   boolean;
  size?:      "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function PartHealthBar({
  healthPct,
  label,
  showPct = true,
  size    = "md",
  className = "",
}: Props) {
  const h = Math.max(0, Math.min(100, healthPct));

  const colour =
    h > 60 ? "#16a34a"  // green-600
    : h > 35 ? "#d97706"  // amber-600
    : h > 20 ? "#dc2626"  // red-600
    :          "#7f1d1d"; // red-900 (critical)

  const barH =
    size === "xs" ? "h-1"
    : size === "sm" ? "h-1.5"
    : size === "lg" ? "h-4"
    : "h-2.5";

  return (
    <div className={`w-full ${className}`}>
      {(label || showPct) && (
        <div className="mb-1 flex items-center justify-between">
          {label && (
            <span className="truncate text-xs font-medium text-stone-600">{label}</span>
          )}
          {showPct && (
            <span
              className="ml-2 shrink-0 text-xs font-bold tabular-nums"
              style={{ color: colour }}
            >
              {h.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-stone-200 ${barH}`}>
        <div
          className={`${barH} rounded-full transition-all duration-700`}
          style={{ width: `${h}%`, backgroundColor: colour }}
        />
      </div>
    </div>
  );
}

// ── Mini variant (no label row) ───────────────────────────────────────────────

export function MiniHealthBar({ healthPct }: { healthPct: number }) {
  return <PartHealthBar healthPct={healthPct} showPct={false} size="xs" />;
}
