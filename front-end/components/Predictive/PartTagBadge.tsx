// components/Predictive/PartTagBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders a single PartTag as a small colour-coded badge with tooltip.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import type { PartTag, TagColour } from "@/lib/types/predictive";

const BADGE_STYLES: Record<TagColour, string> = {
  red:    "bg-red-100 text-red-700 border-red-300",
  amber:  "bg-amber-100 text-amber-700 border-amber-300",
  teal:   "bg-teal-100 text-teal-700 border-teal-300",
  blue:   "bg-blue-100 text-blue-700 border-blue-300",
  green:  "bg-emerald-100 text-emerald-700 border-emerald-300",
  purple: "bg-violet-100 text-violet-700 border-violet-300",
  gray:   "bg-stone-100 text-stone-500 border-stone-300",
};

interface Props {
  tag:       PartTag;
  size?:     "xs" | "sm";
}

export function PartTagBadge({ tag, size = "sm" }: Props) {
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span
      title={tag.reason}
      className={`inline-flex cursor-help items-center gap-0.5 rounded border font-medium
                  px-1.5 py-0.5 ${textSize} ${BADGE_STYLES[tag.colour]}`}
    >
      {tag.urgent && <span className="mr-0.5">⚡</span>}
      {tag.label}
    </span>
  );
}

export function PartTagList({ tags, max }: { tags: PartTag[]; max?: number }) {
  const visible = max ? tags.slice(0, max) : tags;
  const hidden  = max && tags.length > max ? tags.length - max : 0;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(tag => <PartTagBadge key={tag.key} tag={tag} />)}
      {hidden > 0 && (
        <span className="inline-flex items-center rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-xs text-stone-400">
          +{hidden} more
        </span>
      )}
    </div>
  );
}
