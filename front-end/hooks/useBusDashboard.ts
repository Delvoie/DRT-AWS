"use client";
// hooks/useBusDashboard.ts
// All hooks for the PartsInventory / Bus Maintenance Dashboard.
// Named useBusDashboard to avoid conflict with existing hooks/ files.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  GarageLocation,
  MaintenanceStatus,
  RiskLevel,
  ServiceLevel,
  type AutofillOverride,
  type BusRecord,
  type DashboardFilters,
  type MaintenanceEntry,
  type NewMaintenanceEntryForm,
  type UsedPartForm,
} from "@/lib/types";

import { getMockBuses, computeFleetSummary } from "@/lib/mockData";
import { getPartsForServiceLevel, getSpecForAlias } from "@/lib/partsCatalogue";
import { nanoid } from "nanoid";

// ── useBusList ────────────────────────────────────────────────────────────────

export interface UseBusListResult {
  buses: BusRecord[];
  filtered: BusRecord[];
  filters: DashboardFilters;
  setSearch:         (v: string) => void;
  setRiskFilter:     (v: RiskLevel | "ALL") => void;
  setLocationFilter: (v: GarageLocation | "ALL") => void;
  setServiceFilter:  (v: ServiceLevel | "ALL") => void;
  setStatusFilter:   (v: MaintenanceStatus | "ALL") => void;
  summary: ReturnType<typeof computeFleetSummary>;
  isLoading: boolean;
}

export function useBusList(): UseBusListResult {
  const [buses, setBuses] = useState<BusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    search: "", riskLevel: "ALL", location: "ALL", serviceLevel: "ALL", status: "ALL",
  });

  useEffect(() => {
    const id = setTimeout(() => { setBuses(getMockBuses()); setIsLoading(false); }, 120);
    return () => clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return buses.filter(b => {
      if (filters.riskLevel !== "ALL" && b.riskLevel !== filters.riskLevel) return false;
      if (filters.location !== "ALL" && b.location !== filters.location) return false;
      if (filters.serviceLevel !== "ALL" && b.currentServiceLevel !== filters.serviceLevel) return false;
      if (filters.status !== "ALL") {
        const latest = b.maintenanceHistory[0];
        if (!latest || latest.status !== filters.status) return false;
      }
      if (q &&
        !b.alias.toLowerCase().includes(q) &&
        !b.assetDescription.toLowerCase().includes(q) &&
        !b.location.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [buses, filters]);

  const summary = useMemo(() => computeFleetSummary(buses), [buses]);

  return {
    buses, filtered, filters,
    setSearch:         v => setFilters(f => ({ ...f, search: v })),
    setRiskFilter:     v => setFilters(f => ({ ...f, riskLevel: v })),
    setLocationFilter: v => setFilters(f => ({ ...f, location: v })),
    setServiceFilter:  v => setFilters(f => ({ ...f, serviceLevel: v })),
    setStatusFilter:   v => setFilters(f => ({ ...f, status: v })),
    summary,
    isLoading,
  };
}

// ── useBusDetail ──────────────────────────────────────────────────────────────

export interface UseBusDetailResult {
  bus: BusRecord | null;
  history: MaintenanceEntry[];
  addEntry:    (e: MaintenanceEntry) => void;
  updateEntry: (e: MaintenanceEntry) => void;
  deleteEntry: (id: string) => void;
}

export function useBusDetail(alias: string | null, allBuses: BusRecord[]): UseBusDetailResult {
  const [localHistory, setLocalHistory] = useState<MaintenanceEntry[]>([]);
  const [bus, setBus] = useState<BusRecord | null>(null);

  useEffect(() => {
    if (!alias) { setBus(null); setLocalHistory([]); return; }
    const found = allBuses.find(b => b.alias === alias) ?? null;
    setBus(found);
    setLocalHistory(found?.maintenanceHistory ?? []);
  }, [alias, allBuses]);

  return {
    bus,
    history:     localHistory,
    addEntry:    useCallback((e) => setLocalHistory(h => [e, ...h]), []),
    updateEntry: useCallback((e) => setLocalHistory(h => h.map(x => x.id === e.id ? e : x)), []),
    deleteEntry: useCallback((id) => setLocalHistory(h => h.filter(x => x.id !== id)), []),
  };
}

// ── useMaintenanceForm ────────────────────────────────────────────────────────

const EMPTY_FORM: NewMaintenanceEntryForm = {
  busAlias: "", serviceLevel: "", status: MaintenanceStatus.Pending,
  performedBy: "", garage: "", odometerAtService: "",
  scheduledDate: "", completedDate: "", partsUsed: [], notes: "", workOrderNum: "",
};

export interface UseMaintenanceFormResult {
  form: NewMaintenanceEntryForm;
  errors: Partial<Record<keyof NewMaintenanceEntryForm, string>>;
  autofillWarnings: AutofillOverride[];
  dismissWarning: (field: keyof NewMaintenanceEntryForm) => void;
  setField: <K extends keyof NewMaintenanceEntryForm>(k: K, v: NewMaintenanceEntryForm[K]) => void;
  addPartRow:    () => void;
  removePartRow: (i: number) => void;
  setPartField:  (i: number, k: keyof UsedPartForm, v: string | number) => void;
  autofillFromBus: (bus: BusRecord) => void;
  validate: () => boolean;
  toEntry:  () => MaintenanceEntry;
  reset:    () => void;
}

export function useMaintenanceForm(initialForm?: Partial<NewMaintenanceEntryForm>): UseMaintenanceFormResult {
  const [form, setForm] = useState<NewMaintenanceEntryForm>({ ...EMPTY_FORM, ...initialForm });
  const [errors, setErrors] = useState<Partial<Record<keyof NewMaintenanceEntryForm, string>>>({});
  const [autofillWarnings, setAutofillWarnings] = useState<AutofillOverride[]>([]);
  const prevRef = useRef<Partial<NewMaintenanceEntryForm>>({});

  const setField = useCallback(<K extends keyof NewMaintenanceEntryForm>(k: K, v: NewMaintenanceEntryForm[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
    prevRef.current = { ...prevRef.current, [k]: v };
  }, []);

  const addPartRow    = useCallback(() => setForm(f => ({ ...f, partsUsed: [...f.partsUsed, { partNumber: "", partName: "", quantityUsed: "", unit: "each" }] })), []);
  const removePartRow = useCallback((i: number) => setForm(f => ({ ...f, partsUsed: f.partsUsed.filter((_, idx) => idx !== i) })), []);
  const setPartField  = useCallback((i: number, k: keyof UsedPartForm, v: string | number) =>
    setForm(f => ({ ...f, partsUsed: f.partsUsed.map((p, idx) => idx === i ? { ...p, [k]: v } : p) })), []);

  const autofillFromBus = useCallback((bus: BusRecord) => {
    const today = new Date().toISOString().slice(0, 10);
    const proposed: Partial<NewMaintenanceEntryForm> = {
      busAlias: bus.alias, garage: bus.location,
      odometerAtService: bus.pm.odometerKm, serviceLevel: bus.currentServiceLevel,
      workOrderNum: bus.pm.workOrderNum, scheduledDate: today,
    };
    const spec = getSpecForAlias(bus.alias);
    if (spec && bus.currentServiceLevel) {
      proposed.partsUsed = getPartsForServiceLevel(spec, bus.currentServiceLevel).map(p => ({
        partNumber: p.partNumber, partName: p.partName, quantityUsed: p.quantity ?? 1, unit: p.unit ?? "each",
      }));
    }
    const overrides: AutofillOverride[] = [];
    (Object.entries(proposed) as [keyof NewMaintenanceEntryForm, unknown][]).forEach(([k, v]) => {
      const prev = prevRef.current[k];
      if (prev && String(prev) !== String(v)) overrides.push({ field: k, previousValue: String(prev), newValue: String(v) });
    });
    setAutofillWarnings(overrides);
    setForm(f => ({ ...f, ...proposed }));
    prevRef.current = { ...prevRef.current, ...proposed };
  }, []);

  const dismissWarning = useCallback((field: keyof NewMaintenanceEntryForm) =>
    setAutofillWarnings(w => w.filter(x => x.field !== field)), []);

  const validate = useCallback((): boolean => {
    const errs: Partial<Record<keyof NewMaintenanceEntryForm, string>> = {};
    if (!form.busAlias)      errs.busAlias      = "Bus is required";
    if (!form.serviceLevel)  errs.serviceLevel  = "Service level is required";
    if (!form.garage)        errs.garage        = "Garage is required";
    if (!form.scheduledDate) errs.scheduledDate = "Scheduled date is required";
    if (!form.performedBy)   errs.performedBy   = "Technician name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const toEntry = useCallback((): MaintenanceEntry => {
    const now = new Date();
    return {
      id: nanoid(), busAlias: form.busAlias,
      serviceLevel: form.serviceLevel as ServiceLevel,
      status: form.status, performedBy: form.performedBy,
      garage: form.garage as GarageLocation,
      odometerAtService: Number(form.odometerAtService) || 0,
      scheduledDate: new Date(form.scheduledDate),
      completedDate: form.completedDate ? new Date(form.completedDate) : null,
      partsUsed: form.partsUsed.map(p => ({
        partNumber: p.partNumber, partName: p.partName,
        quantityUsed: Number(p.quantityUsed) || 1, unit: p.unit,
      })),
      notes: form.notes, workOrderNum: form.workOrderNum,
      createdAt: now, updatedAt: now,
    };
  }, [form]);

  const reset = useCallback(() => {
    setForm({ ...EMPTY_FORM, ...initialForm });
    setErrors({});
    setAutofillWarnings([]);
    prevRef.current = {};
  }, [initialForm]);

  return { form, errors, autofillWarnings, dismissWarning, setField, addPartRow, removePartRow, setPartField, autofillFromBus, validate, toEntry, reset };
}

// ── useUpdateForm ─────────────────────────────────────────────────────────────

export function useUpdateForm(entry: MaintenanceEntry | null) {
  const initial: Partial<NewMaintenanceEntryForm> = entry ? {
    busAlias: entry.busAlias, serviceLevel: entry.serviceLevel,
    status: entry.status, performedBy: entry.performedBy, garage: entry.garage,
    odometerAtService: entry.odometerAtService,
    scheduledDate: (entry.scheduledDate instanceof Date ? entry.scheduledDate : new Date(entry.scheduledDate)).toISOString().slice(0, 10),
    completedDate: entry.completedDate ? (entry.completedDate instanceof Date ? entry.completedDate : new Date(entry.completedDate)).toISOString().slice(0, 10) : "",
    partsUsed: entry.partsUsed.map(p => ({ ...p })),
    notes: entry.notes, workOrderNum: entry.workOrderNum,
  } : {};
  return useMaintenanceForm(initial);
}
