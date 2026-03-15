// src/components/BusDashboard.tsx
"use client";

import { useState } from "react";
import type { BusRecord, MaintenanceEntry } from "@/lib/types";
import { useBusList, useBusDetail, useMaintenanceForm, useUpdateForm } from "@/hooks/useBusDashboard";
import { BusList }              from "@/components/PartsInventory/BusList";
import { BusDetailPanel }       from "@/components/PartsInventory/BusDetailPanel";
import { FleetOverview }        from "@/components/PartsInventory/FleetOverview";
import { MaintenanceEntryForm } from "@/components/PartsInventory/MaintenanceEntryForm";
import { MockDataPanel }        from "@/components/PartsInventory/MockDataPanel";
import { Modal }                from "@/components/PartsInventory/Modal";

type ModalMode = "new" | "edit" | null;
type AppView   = "dashboard" | "mock";

export function BusDashboard() {
  const listData       = useBusList();
  const [appView, setAppView]         = useState<AppView>("dashboard");
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null);
  const detail         = useBusDetail(selectedAlias, listData.buses);
  const [modalMode, setModalMode]     = useState<ModalMode>(null);
  const [editTarget, setEditTarget]   = useState<MaintenanceEntry | null>(null);
  const newForm        = useMaintenanceForm();
  const updateForm     = useUpdateForm(editTarget);

  function openNewEntry(bus: BusRecord) {
    newForm.reset();
    newForm.autofillFromBus(bus);
    setModalMode("new");
  }

  function openEditEntry(entry: MaintenanceEntry) {
    setEditTarget(entry);
    setModalMode("edit");
  }

  function closeModal() { setModalMode(null); setEditTarget(null); }

  function handleNewSubmit(entry: MaintenanceEntry) {
    detail.addEntry(entry);
    closeModal();
  }

  function handleUpdateSubmit(entry: MaintenanceEntry) {
    if (!editTarget) return;
    detail.updateEntry({ ...entry, id: editTarget.id });
    closeModal();
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f6f4ef]">
        {/* ── Top bar ──────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center gap-4 border-b border-stone-700 bg-[#1c2a2f] px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚌</span>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">
                DRT Bus Maintenance
              </h1>
              <p className="text-[10px] text-stone-400">
                Fleet dashboard · Durham Region Transit
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="ml-6 flex gap-1">
            {([["dashboard","Dashboard"],["mock","Mock Data"]] as const).map(([v,label]) => (
              <button
                key={v}
                onClick={() => setAppView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  appView === v
                    ? "bg-teal-700 text-white"
                    : "text-stone-400 hover:bg-stone-700 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto">
            <span className="rounded-full border border-stone-600 bg-stone-700 px-3 py-1 text-xs text-stone-300">
              {listData.buses.length} buses loaded
            </span>
          </div>
        </header>

        {appView === "dashboard" ? (
          <>
            {/* ── Fleet KPIs ──────────────────────────────────── */}
            <FleetOverview listData={listData} />

            {/* ── Two-pane layout ─────────────────────────────── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Left: bus list */}
              <div className="w-72 shrink-0 overflow-hidden border-r border-stone-200">
                <BusList
                  listData={listData}
                  selectedAlias={selectedAlias}
                  onSelect={setSelectedAlias}
                />
              </div>

              {/* Right: detail */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <BusDetailPanel
                  detail={detail}
                  onNewEntry={openNewEntry}
                  onEditEntry={openEditEntry}
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Mock Data Panel ─────────────────────────────────── */
          <div className="flex-1 overflow-y-auto">
            <MockDataPanel />
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <Modal
        title="New Maintenance Entry"
        open={modalMode === "new"}
        onClose={closeModal}
      >
        <MaintenanceEntryForm
          formData={newForm}
          buses={listData.buses}
          mode="new"
          onSubmit={handleNewSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        title={`Edit Entry — Bus ${editTarget?.busAlias ?? ""}`}
        open={modalMode === "edit"}
        onClose={closeModal}
      >
        <MaintenanceEntryForm
          formData={updateForm}
          buses={listData.buses}
          mode="edit"
          onSubmit={handleUpdateSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
