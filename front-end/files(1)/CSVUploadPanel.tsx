// src/components/CSVUploadPanel.tsx
// Drag-and-drop + file picker for uploading current and optional previous PM CSVs.
// Calls useCSVUpload and exposes the resulting report upward via onReportReady.

"use client";

import { useCallback, useRef, useState } from "react";
import { useCSVUpload } from "@/hooks/useCSVUpload";
import type { BusRiskReport } from "@/lib/types";

interface Props {
  onReportReady: (report: BusRiskReport) => void;
}

interface FileSlotProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFile: (f: File | null) => void;
  accept?: string;
}

function FileSlot({ label, required, file, onFile, accept = ".csv" }: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0] ?? null;
      onFile(picked);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [onFile]
  );

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex cursor-pointer flex-col items-center justify-center gap-1.5
          rounded-xl border-2 border-dashed px-4 py-5 text-center
          transition-colors duration-150
          ${dragging
            ? "border-teal-400 bg-teal-50"
            : file
            ? "border-emerald-300 bg-emerald-50"
            : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100"
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={`${label} — click or drag to select CSV`}
      >
        {file ? (
          <>
            <span className="text-lg">✓</span>
            <p className="max-w-[180px] truncate text-xs font-medium text-emerald-700">
              {file.name}
            </p>
            <p className="text-[0.68rem] text-emerald-600">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </>
        ) : (
          <>
            <span className="text-xl text-stone-400">↑</span>
            <p className="text-xs text-stone-500">
              Drop CSV here or <span className="text-teal-700 underline">browse</span>
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {file && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFile(null); }}
          className="text-[0.68rem] text-stone-400 underline hover:text-stone-600"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export function CSVUploadPanel({ onReportReady }: Props) {
  const {
    files,
    status,
    error,
    report,
    setCurrentFile,
    setPreviousFile,
    upload,
    reset,
  } = useCSVUpload();

  // Fire callback when report arrives
  const handleUpload = useCallback(async () => {
    await upload();
  }, [upload]);

  // Expose report as soon as it appears
  if (report && status === "success") {
    // Defer so state settles before callback
    setTimeout(() => onReportReady(report), 0);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Import CSV Snapshots</h2>
          <p className="mt-0.5 text-xs text-stone-400">
            Upload your Maximo PM exports. Previous snapshot enables delta tracking.
          </p>
        </div>
        {(files.current ?? files.previous) && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-stone-400 underline hover:text-stone-600"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileSlot
          label="Current PM snapshot"
          required
          file={files.current}
          onFile={setCurrentFile}
        />
        <FileSlot
          label="Previous PM snapshot (optional)"
          file={files.previous}
          onFile={setPreviousFile}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {status === "success" && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          ✓ Report built successfully — dashboard updated below.
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!files.current || status === "uploading"}
        className="
          mt-4 w-full rounded-xl bg-teal-700 px-4 py-2.5
          text-sm font-semibold text-white shadow-sm
          hover:bg-teal-800 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all
        "
      >
        {status === "uploading" ? "Building report…" : "Build risk report →"}
      </button>
    </div>
  );
}
