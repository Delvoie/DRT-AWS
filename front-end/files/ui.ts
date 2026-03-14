// ─────────────────────────────────────────────────────────────────────────────
// ui.ts — DRT Fleet Risk Tracker
// DOM rendering: summary cards, risk table rows, and filter application.
// All DOM queries are typed and guarded; no `any` or non-null assertions.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DataFreshness,
  RiskLevel,
  type BusRiskDetails,
  type BusRiskReport,
  type FilterState,
  type RiskFilterValue,
} from "./types.js";

// ── Selector helpers ──────────────────────────────────────────────────────────

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLElement)) {
    throw new Error(`Required element #${id} not found in DOM.`);
  }
  return el as T;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function formatKm(value: number): string {
  return value.toLocaleString() + " km";
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "n/a";
  return (delta >= 0 ? "+" : "") + delta.toLocaleString();
}

// ── Badge / chip HTML factories ───────────────────────────────────────────────

function riskBadgeHtml(level: RiskLevel, label: string): string {
  const classMap: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: "badge badge-critical",
    [RiskLevel.WARNING]: "badge badge-warning",
    [RiskLevel.STABLE]: "badge badge-stable",
  };
  return `<span class="${classMap[level]}">${level}</span><br><span class="label-sub">${label}</span>`;
}

function chipHtml(text: string): string {
  return `<span class="chip">${escapeHtml(text)}</span>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function cardHtml(title: string, value: string, colorClass: string): string {
  return `
    <article class="card">
      <h3>${title}</h3>
      <div class="num ${colorClass}">${value}</div>
    </article>`;
}

export function renderSummaryCards(report: BusRiskReport): void {
  const el = getElement("summaryCards");
  const { fleet } = report;

  el.innerHTML = [
    cardHtml("Total Assets", String(fleet.totalAssets), ""),
    cardHtml("Critical", String(fleet.critical), "critical-text"),
    cardHtml("Warning", String(fleet.warning), "warning-text"),
    cardHtml("Overdue %", fleet.overduePercent.toFixed(1) + "%", "stable-text"),
  ].join("");

  // Depot breakdown cards
  for (const depot of report.depots) {
    el.innerHTML += cardHtml(
      depot.location,
      `${depot.critical}C / ${depot.warning}W / ${depot.stable}S`,
      ""
    );
  }
}

// ── Table rows ────────────────────────────────────────────────────────────────

function assetRowHtml(asset: BusRiskDetails, index: number): string {
  const factors = asset.riskFactors.map(chipHtml).join("");
  const freshnessBadge =
    asset.dataFreshness !== DataFreshness.CURRENT
      ? `<span class="chip chip-warn">data ${asset.dataFreshness.toLowerCase()}</span>`
      : "";

  return `
    <tr style="animation-delay:${(index * 0.01).toFixed(2)}s">
      <td>
        <strong class="mono">${escapeHtml(asset.busNumber)}</strong><br>
        <span>${escapeHtml(asset.assetDescription)}</span><br>
        <span class="chip">${asset.assetType}</span>
        ${asset.yearBuilt != null ? `<span class="chip">${asset.yearBuilt} · ${asset.ageYears ?? 0}yr</span>` : ""}
      </td>
      <td>${riskBadgeHtml(asset.riskLevel, asset.riskLabel)}</td>
      <td>${escapeHtml(asset.assetStatus)}</td>
      <td>${escapeHtml(asset.location)}</td>
      <td class="mono">
        ${formatKm(asset.unitsLate)}<br>
        <span class="label-sub">delta: ${formatDelta(asset.unitsLateDelta)}</span>
      </td>
      <td class="mono">${asset.daysOverdue}d</td>
      <td class="mono">${formatKm(asset.odometerKm)} / ${formatKm(asset.nextServiceKm)}</td>
      <td class="mono">
        ${formatKm(asset.toleranceKm)}<br>
        <span class="label-sub">ratio: ${asset.riskRatio.toFixed(2)}</span>
      </td>
      <td class="mono">${formatDate(asset.reportDate)}${freshnessBadge}</td>
      <td>
        <div class="chip-group">${escapeHtml(asset.currentJobPlan)}</div>
        ${factors}
      </td>
    </tr>`;
}

export function renderRiskRows(assets: readonly BusRiskDetails[]): void {
  const tbody = getElement<HTMLTableSectionElement>("riskBody");
  tbody.innerHTML = assets.map(assetRowHtml).join("");
}

// ── Status footer ─────────────────────────────────────────────────────────────

export function renderStatus(message: string, isError = false): void {
  const el = getElement("statusText");
  if (isError) {
    el.innerHTML = `<span class="error">${escapeHtml(message)}</span>`;
  } else {
    el.textContent = message;
  }
}

// ── Filter logic ──────────────────────────────────────────────────────────────

export function filterAssets(
  assets: readonly BusRiskDetails[],
  state: FilterState
): BusRiskDetails[] {
  const query = state.query.toLowerCase().trim();

  return assets.filter((asset) => {
    // Risk level filter
    if (state.riskLevel !== "ALL" && asset.riskLevel !== state.riskLevel) {
      return false;
    }

    // Full-text search across key fields
    if (query) {
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

      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

// ── Filter state readers ──────────────────────────────────────────────────────

function isRiskFilterValue(value: string): value is RiskFilterValue {
  return (
    value === "ALL" ||
    value === RiskLevel.CRITICAL ||
    value === RiskLevel.WARNING ||
    value === RiskLevel.STABLE
  );
}

export function readFilterState(): FilterState {
  const searchEl = getElement<HTMLInputElement>("searchInput");
  const riskEl = getElement<HTMLSelectElement>("riskFilter");

  const raw = riskEl.value;
  const riskLevel: RiskFilterValue = isRiskFilterValue(raw) ? raw : "ALL";

  return {
    query: searchEl.value ?? "",
    riskLevel,
  };
}

// ── Event binding ─────────────────────────────────────────────────────────────

/**
 * Binds the search input and risk filter select to a shared handler.
 * The handler receives the current filter state every time either input changes.
 */
export function bindFilterControls(
  onFilterChange: (state: FilterState) => void
): void {
  const searchEl = getElement<HTMLInputElement>("searchInput");
  const riskEl = getElement<HTMLSelectElement>("riskFilter");

  const handler = (): void => onFilterChange(readFilterState());

  searchEl.addEventListener("input", handler);
  riskEl.addEventListener("change", handler);
}
