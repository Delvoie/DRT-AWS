// src/components/forms/MaintenanceEntryForm.tsx
"use client";

import {
  GarageLocation, MaintenanceStatus, ServiceLevel,
  type BusRecord, type MaintenanceEntry,
} from "@/lib/types";
import {
  Field, Input, Select, Textarea, Button,
  AutofillWarningBanner,
} from "@/components/PartsInventory/ui";
import type { UseMaintenanceFormResult } from "@/hooks/useBusDashboard";

interface Props {
  formData:  UseMaintenanceFormResult;
  buses:     BusRecord[];
  mode:      "new" | "edit";
  onSubmit:  (entry: MaintenanceEntry) => void;
  onCancel:  () => void;
}

export function MaintenanceEntryForm({ formData, buses, mode, onSubmit, onCancel }: Props) {
  const {
    form, errors, autofillWarnings, dismissWarning,
    setField, addPartRow, removePartRow, setPartField,
    autofillFromBus, validate, toEntry, reset,
  } = formData;

  function handleBusChange(alias: string) {
    setField("busAlias", alias);
    if (alias && alias !== "+ New Record") {
      const bus = buses.find(b => b.alias === alias);
      if (bus) autofillFromBus(bus);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const entry = toEntry();
    onSubmit(entry);
    if (mode === "new") reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Autofill warnings */}
      <AutofillWarningBanner warnings={autofillWarnings} onDismiss={dismissWarning} />

      {/* ── Core fields ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bus" required error={errors.busAlias}>
          <Select
            value={form.busAlias}
            onChange={e => handleBusChange(e.target.value)}
          >
            <option value="">Select bus…</option>
            <option value="+ New Record">+ New Record</option>
            {buses.map(b => (
              <option key={b.alias} value={b.alias}>
                {b.alias} — {b.location}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Service Level" required error={errors.serviceLevel}>
          <Select
            value={form.serviceLevel}
            onChange={e => setField("serviceLevel", e.target.value as ServiceLevel | "")}
          >
            <option value="">Select level…</option>
            <option value="+ New Record">+ New Record</option>
            {Object.values(ServiceLevel).map(l => (
              <option key={l} value={l}>Service {l}</option>
            ))}
          </Select>
        </Field>

        <Field label="Status">
          <Select
            value={form.status}
            onChange={e => setField("status", e.target.value as MaintenanceStatus)}
          >
            {Object.values(MaintenanceStatus).map(s => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </Select>
        </Field>

        <Field label="Garage" required error={errors.garage}>
          <Select
            value={form.garage}
            onChange={e => setField("garage", e.target.value as GarageLocation | "")}
          >
            <option value="">Select garage…</option>
            <option value="+ New Record">+ New Record</option>
            {Object.values(GarageLocation).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </Field>

        <Field label="Technician / Performed By" required error={errors.performedBy}>
          <Input
            value={form.performedBy}
            onChange={e => setField("performedBy", e.target.value)}
            placeholder="e.g. J. Morrison"
          />
        </Field>

        <Field label="Work Order #">
          <Input
            value={form.workOrderNum}
            onChange={e => setField("workOrderNum", e.target.value)}
            placeholder="e.g. T1071388"
          />
        </Field>

        <Field label="Odometer at Service (km)">
          <Input
            type="number"
            value={form.odometerAtService}
            onChange={e => setField("odometerAtService", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 808650"
          />
          {form.odometerAtService !== "" && (
            <p className="mt-0.5 text-[10px] text-teal-600">
              ✓ Auto-filled from PM record — editable
            </p>
          )}
        </Field>

        <Field label="Scheduled Date" required error={errors.scheduledDate}>
          <Input
            type="date"
            value={form.scheduledDate}
            onChange={e => setField("scheduledDate", e.target.value)}
          />
        </Field>

        <Field label="Completed Date">
          <Input
            type="date"
            value={form.completedDate}
            onChange={e => setField("completedDate", e.target.value)}
          />
        </Field>
      </div>

      {/* ── Parts used ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">
            Parts Used
            {form.partsUsed.length > 0 && (
              <span className="ml-2 text-xs font-normal text-teal-600">
                ✓ {form.partsUsed.length} auto-filled from spec
              </span>
            )}
          </h3>
          <Button type="button" variant="ghost" className="text-xs" onClick={addPartRow}>
            + Add Part
          </Button>
        </div>

        {form.partsUsed.length === 0 ? (
          <p className="text-xs text-stone-400">No parts added. Select a bus and service level to auto-fill from the parts catalogue.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-xs">
              <thead className="bg-stone-50">
                <tr>
                  {["Part Name","Part #","Qty","Unit",""].map(h => (
                    <th key={h} className="border-b border-stone-200 px-3 py-2 text-left font-semibold text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.partsUsed.map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="px-2 py-1.5">
                      <input
                        value={p.partName}
                        onChange={e => setPartField(i, "partName", e.target.value)}
                        className="w-full rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                        placeholder="Part name"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={p.partNumber}
                        onChange={e => setPartField(i, "partNumber", e.target.value)}
                        className="w-full rounded border border-stone-200 px-2 py-1 font-mono text-xs focus:border-teal-500 focus:outline-none"
                        placeholder="Part #"
                      />
                    </td>
                    <td className="w-16 px-2 py-1.5">
                      <input
                        type="number"
                        value={p.quantityUsed}
                        onChange={e => setPartField(i, "quantityUsed", e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                        min="0"
                      />
                    </td>
                    <td className="w-20 px-2 py-1.5">
                      <input
                        value={p.unit}
                        onChange={e => setPartField(i, "unit", e.target.value)}
                        className="w-full rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                        placeholder="unit"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" onClick={() => removePartRow(i)} className="text-red-400 hover:text-red-600">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      <Field label="Notes">
        <Textarea
          value={form.notes}
          onChange={e => setField("notes", e.target.value)}
          placeholder="Observations, anomalies, actions taken…"
        />
      </Field>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          {mode === "new" ? "Create Entry" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
