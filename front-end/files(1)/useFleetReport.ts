// src/hooks/useFleetReport.ts
// Fetches the fleet risk report from the API route and manages loading/error state.

"use client";

import { useEffect, useState } from "react";
import type { BusRiskReport } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

interface UseFleetReportResult {
  report: BusRiskReport | null;
  status: Status;
  error: string | null;
  refresh: () => void;
}

export function useFleetReport(): UseFleetReportResult {
  const [report, setReport] = useState<BusRiskReport | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch("/api/fleet-report");

        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = (await res.json()) as BusRiskReport;

        if (!cancelled) {
          setReport(data);
          setStatus("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setStatus("error");
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [tick]);

  return {
    report,
    status,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
