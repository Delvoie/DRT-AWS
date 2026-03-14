// src/hooks/useCSVUpload.ts
// Manages local CSV file selection and upload to /api/upload-csv.
// Returns the resulting BusRiskReport so FleetDashboard can use it
// instead of (or alongside) the server-side file-based report.

"use client";

import { useCallback, useRef, useState } from "react";
import type { BusRiskReport } from "@/lib/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface SelectedFiles {
  current: File | null;
  previous: File | null;
}

interface UseCSVUploadResult {
  files: SelectedFiles;
  status: UploadStatus;
  error: string | null;
  report: BusRiskReport | null;
  setCurrentFile: (file: File | null) => void;
  setPreviousFile: (file: File | null) => void;
  upload: () => Promise<void>;
  reset: () => void;
}

export function useCSVUpload(): UseCSVUploadResult {
  const [files, setFiles] = useState<SelectedFiles>({
    current: null,
    previous: null,
  });
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BusRiskReport | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setCurrentFile = useCallback((file: File | null) => {
    setFiles((f) => ({ ...f, current: file }));
    setStatus("idle");
    setError(null);
  }, []);

  const setPreviousFile = useCallback((file: File | null) => {
    setFiles((f) => ({ ...f, previous: file }));
    setStatus("idle");
    setError(null);
  }, []);

  const upload = useCallback(async () => {
    if (!files.current) {
      setError("Please select a current PM CSV file first.");
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("uploading");
    setError(null);

    try {
      const form = new FormData();
      form.append("current", files.current);
      if (files.previous) {
        form.append("previous", files.previous);
      }

      const res = await fetch("/api/upload-csv", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as BusRiskReport;
      setReport(data);
      setStatus("success");
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  }, [files]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFiles({ current: null, previous: null });
    setStatus("idle");
    setError(null);
    setReport(null);
  }, []);

  return {
    files,
    status,
    error,
    report,
    setCurrentFile,
    setPreviousFile,
    upload,
    reset,
  };
}
