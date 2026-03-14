// src/app/api/upload-csv/route.ts
// Accepts a multipart/form-data POST with `current` and optional `previous` CSV files.
// Parses them in-memory and returns a full BusRiskReport — nothing is written to disk.

import { NextRequest, NextResponse } from "next/server";
import { buildBusRiskReport } from "@/lib/risk";
import type { BusRiskReport } from "@/lib/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

const AS_OF_DATE = new Date("2026-03-14T00:00:00");

export async function POST(
  req: NextRequest
): Promise<NextResponse<BusRiskReport | { error: string }>> {
  try {
    const form = await req.formData();

    const currentFile = form.get("current");
    const previousFile = form.get("previous");

    if (!(currentFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing required field: current (CSV file)" },
        { status: 400 }
      );
    }

    if (currentFile.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File too large: current CSV exceeds 5 MB` },
        { status: 413 }
      );
    }

    const currentText = await currentFile.text();
    const previousText =
      previousFile instanceof File && previousFile.size > 0
        ? await previousFile.text()
        : undefined;

    const report = buildBusRiskReport(currentText, previousText, AS_OF_DATE);

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[upload-csv]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
