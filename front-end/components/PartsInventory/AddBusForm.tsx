"use client";

import { useState } from "react";
import { BusManufacturer, GarageLocation, RiskLevel, ServiceLevel, type BusRecord } from "@/lib/types";
import { Button } from "./ui";

interface Props {
  onSubmit: (bus: BusRecord) => void;
  onCancel: () => void;
}

export function AddBusForm({ onSubmit, onCancel }: Props) {
  const [alias, setAlias] = useState("");
  const [manufacturer, setManufacturer] = useState<BusManufacturer>(BusManufacturer.NewFlyer);
  const [location, setLocation] = useState<GarageLocation>(GarageLocation.Raleigh);
  const [odometer, setOdometer] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!alias) return;

    const newBus: BusRecord = {
      alias,
      manufacturer,
      rangeLabel: `${alias} Series`,
      assetDescription: `${manufacturer} Transit Bus`,
      location,
      assetStatus: "ACTIVE",
      pm: {
        alias,
        pmNum: "PM-0000",
        pmDescription: "Initial PM",
        jobPlanDescription: "Standard Plan",
        currentJobPlan: "Standard Plan",
        workOrderNum: "WO-0000",
        assetNum: alias,
        assetDescription: `${manufacturer} Transit Bus`,
        location,
        pmStatus: "ACTIVE",
        assetStatus: "ACTIVE",
        odometerKm: Number(odometer) || 0,
        nextTriggerKm: (Number(odometer) || 0) + 5000,
        kmToNext: 5000,
        frequency: 5000,
        tolerance: 500,
        unitsLate: 0,
        daysLate: 0,
        lastPMReading: Number(odometer) || 0,
        reportDate: new Date(),
        riskLevel: RiskLevel.Stable,
        riskScore: 0,
      },
      serviceSpec: null,
      currentServiceLevel: ServiceLevel.A,
      maintenanceHistory: [],
      riskLevel: RiskLevel.Stable,
      riskScore: 0,
    };

    onSubmit(newBus);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-700">
          Bus Alias (ID)
          <input
            autoFocus
            type="text"
            required
            value={alias}
            onChange={e => setAlias(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="e.g. 7101"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Initial Odometer (km)
          <input
            type="number"
            value={odometer}
            onChange={e => setOdometer(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="0"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Manufacturer
          <select
            value={manufacturer}
            onChange={e => setManufacturer(e.target.value as BusManufacturer)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {Object.values(BusManufacturer).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Garage Location
          <select
            value={location}
            onChange={e => setLocation(e.target.value as GarageLocation)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {Object.values(GarageLocation).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add Bus
        </Button>
      </div>
    </form>
  );
}
