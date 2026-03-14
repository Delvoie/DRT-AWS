// src/app/api/fleet-report/route.ts
// Server-side API route — reads CSV files from disk and returns a BusRiskReport.
// CSVs live in /public/data/ so they can also be served statically if needed.

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { buildBusRiskReport } from "@/lib/risk";
import type { BusRiskReport } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const CURRENT_CSV = path.join(DATA_DIR, "pm-current.csv");
const PREVIOUS_CSV = path.join(DATA_DIR, "pm-previous.csv");

// The reference date for risk calculations — update to `new Date()` for live use
const AS_OF_DATE = new Date("2026-03-14T00:00:00");

export async function GET(): Promise<NextResponse<BusRiskReport | { error: string }>> {
  try {
    const [currentCsv, previousCsv] = await Promise.all([
      fs.readFile(CURRENT_CSV, "utf-8"),
      fs.readFile(PREVIOUS_CSV, "utf-8").catch(() => ""), // previous snapshot is optional
    ]);

    const report = buildBusRiskReport(currentCsv, previousCsv || undefined, AS_OF_DATE);

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[fleet-report]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
