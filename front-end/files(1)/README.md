# DRT Fleet Risk Tracker — Next.js + React + TypeScript

Preventative-maintenance risk dashboard for the DRT transit fleet.
Parses Maximo PM CSV exports, scores every asset by risk level, and renders a
sortable, filterable table with delta tracking, a slide-out detail drawer, per-depot
stacked-bar charts, CSV upload, and CSV export.

---

## Quick start

```bash
# 1. Install dependencies (assumes an existing Next.js 14+ project)
npm install

# 2. Drop your CSV exports into:
#    public/data/pm-current.csv   ← most recent Maximo PM export
#    public/data/pm-previous.csv  ← older snapshot for delta tracking (optional)

# 3. Start the dev server
npm run dev
# → http://localhost:3000
```

No database required. CSV files are read server-side by the API route on every
request. Use the **Upload CSV** button in the UI to load files without restarting.

---

## Project structure

```
src/
├── lib/                          # Pure domain logic — no React, no DOM
│   ├── types.ts                  # All enums + interfaces (RiskLevel, BusRiskDetails, …)
│   ├── csv.ts                    # RFC-4180 CSV parser, Maximo type-row detection,
│   │                             #   latestRowByAlias deduplication
│   ├── risk.ts                   # Risk engine: normalisation, scoring, buildBusRiskReport()
│   └── export.ts                 # reportToCsv() + downloadCsv() browser trigger
│
├── hooks/
│   ├── useFleetReport.ts         # Fetches /api/fleet-report, manages loading/error/refresh
│   ├── useFleetFilters.ts        # Search + risk-level filter state, filtered assets via useMemo
│   └── useCSVUpload.ts           # File selection, FormData POST to /api/upload-csv
│
├── components/
│   ├── FleetDashboard.tsx        # Root "use client" shell — composes everything,
│   │                             #   owns drawer + upload + export state
│   ├── FleetSummaryCards.tsx     # KPI cards: total, critical, warning, overdue %, per-depot
│   ├── DepotBreakdown.tsx        # Stacked CSS bar chart per garage location
│   ├── FilterBar.tsx             # Controlled search input + risk-level select
│   ├── RiskTable.tsx             # Sortable table (click any header to sort)
│   ├── AssetRow.tsx              # Single <tr> — progress bar, delta chips, freshness badge
│   ├── RiskBadge.tsx             # CRITICAL / WARNING / STABLE pill badge
│   ├── AssetDrawer.tsx           # Slide-out detail panel (Escape to close, focus-trapped)
│   └── CSVUploadPanel.tsx        # Drag-and-drop + file picker for current + previous CSV
│
└── app/
    ├── page.tsx                  # Server component — just renders <FleetDashboard />
    ├── layout.tsx                # Root layout with Geist Mono font
    ├── globals.css               # Tailwind directives + row entrance animation
    └── api/
        ├── fleet-report/
        │   └── route.ts          # GET  — reads public/data/*.csv from disk
        └── upload-csv/
            └── route.ts          # POST — accepts multipart/form-data, parses in-memory
```

---

## Risk scoring rules

| Condition | Level |
|---|---|
| `assetStatus === "DOWN"` | **CRITICAL** |
| `unitsLate > tolerance` OR `daysLate > 14` | **CRITICAL** |
| `unitsLate > tolerance × 0.5` OR `daysLate > 7` | **WARNING** |
| Otherwise | **STABLE** |

Tolerance is read directly from the CSV `tolerance` column (typically `1000` km).

---

## CSV format

The tracker expects Maximo's standard PM export format:

```
cgdivision,ownergroup,pmnum,...   ← header row (lowercased)
String,String,String,...          ← Maximo type-hint row (auto-skipped)
TRANSIT,TR-WESTNEY-WO,...         ← data rows
```

Required columns: `alias`, `lastreading`, `nexttrigger`, `unitslate`, `dayslate`,
`tolerance`, `assetstatus`, `locdescription`, `reportdate`, `curjpdescription`,
`jpdescription`, `assetdescription`, `metername`.

All other columns are preserved in `MaintenanceCsvRow` for future use.

---

## Adding a new feature

### New risk factor
Edit `rowToRiskDetails()` in `src/lib/risk.ts` — push a string into `riskFactors`.

### New summary card
Add to `FleetSummaryCards.tsx`. The `BusRiskReport` already carries `fleet` and
`depots` aggregates; extend `FleetRiskSummary` in `types.ts` if you need a new field.

### New table column
1. Add a `ColDef` entry to `COLUMNS` in `RiskTable.tsx`
2. Add a `case` to `renderCell()` in `AssetRow.tsx`
3. If sortable, add the key to the `SortKey` union in `RiskTable.tsx`

### Persist notes / history
The current build is stateless — each load re-parses the CSV.
To add persistence, replace the `fs.readFile` calls in `api/fleet-report/route.ts`
with reads from a database (Postgres via Prisma, Supabase, etc.) and add a
`POST /api/fleet-report` route that stores uploaded snapshots.

---

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_AS_OF_DATE` | `2026-03-14` | Override the risk reference date |

To use today's date instead of the hardcoded snapshot date, replace:
```ts
const AS_OF_DATE = new Date("2026-03-14T00:00:00");
```
with:
```ts
const AS_OF_DATE = new Date();
```
in both `src/app/api/fleet-report/route.ts` and `src/app/api/upload-csv/route.ts`.
