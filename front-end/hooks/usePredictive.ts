"use client";
// hooks/usePredictive.ts
// ─────────────────────────────────────────────────────────────────────────────
// React data layer for the Predictive Parts Tagging System.
// All components import from here — never from mockPredictiveData directly.
// When you wire a real API, swap the mock calls inside this hook only.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BusRecord } from "@/lib/types";
import type {
  NotificationPriority,
  PartHealthRecord,
  PredictiveFleetSummary,
  PredictiveNotification,
} from "@/lib/types/predictive";
import {
  getMockPartHealthRecords,
  // getMockNotifications,
  getMockPredictiveSummary,
  getMockRecordsForBus,
} from "@/lib/predictive/mockPredictiveData";
import { buildBusHealthRecords } from "@/lib/predictive/healthEngine";

// ── useFleetPredictive — fleet-wide data for the dashboard ────────────────────

export interface UseFleetPredictiveResult {
  records:       PartHealthRecord[];
  notifications: PredictiveNotification[];
  summary:       PredictiveFleetSummary;
  isLoading:     boolean;
  // Notification actions
  dismiss:    (id: string) => void;
  snooze:     (id: string, days?: number) => void;
  // Filters
  priorityFilter:    NotificationPriority | "ALL";
  setPriorityFilter: (v: NotificationPriority | "ALL") => void;
  filteredNotifications: PredictiveNotification[];
  // Counts by priority
  counts: Record<NotificationPriority, number>;
}

export function useFleetPredictive(): UseFleetPredictiveResult {
  const [isLoading, setIsLoading]       = useState(true);
  const [records, setRecords]           = useState<PartHealthRecord[]>([]);
  const [allNotifications, setAllNotifications] = useState<PredictiveNotification[]>([]);
  const [summary, setSummary]           = useState<PredictiveFleetSummary>({
    totalParts: 0, criticalCount: 0, orderNowCount: 0,
    orderSoonCount: 0, seasonalRiskCount: 0, avgFleetHealth: 100,
  });
  const [dismissed, setDismissed]       = useState<Set<string>>(new Set());
  const [snoozedUntil, setSnoozedUntil] = useState<Map<string, Date>>(new Map());
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | "ALL">("ALL");

  // Load data once (swap for real fetch here when backend is ready)
  useEffect(() => {
    const t = setTimeout(() => {
      setRecords(getMockPartHealthRecords());
      // setAllNotifications(getMockNotifications());
      setSummary(getMockPredictiveSummary());
      setIsLoading(false);
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  }, []);

  const snooze = useCallback((id: string, days = 7) => {
    setSnoozedUntil(prev => {
      const next = new Map(prev);
      const until = new Date();
      until.setDate(until.getDate() + days);
      next.set(id, until);
      return next;
    });
  }, []);

  const now = new Date();

  const activeNotifications = useMemo(() =>
    allNotifications.filter(n => {
      if (dismissed.has(n.id)) return false;
      const snoozed = snoozedUntil.get(n.id);
      if (snoozed && snoozed > now) return false;
      return true;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allNotifications, dismissed, snoozedUntil]
  );

  const filteredNotifications = useMemo(() =>
    priorityFilter === "ALL"
      ? activeNotifications
      : activeNotifications.filter(n => n.priority === priorityFilter),
    [activeNotifications, priorityFilter]
  );

  const counts = useMemo(() => ({
    CRITICAL: activeNotifications.filter(n => n.priority === "CRITICAL").length,
    HIGH:     activeNotifications.filter(n => n.priority === "HIGH").length,
    MEDIUM:   activeNotifications.filter(n => n.priority === "MEDIUM").length,
    LOW:      activeNotifications.filter(n => n.priority === "LOW").length,
  }), [activeNotifications]);

  return {
    records, notifications: activeNotifications, summary, isLoading,
    dismiss, snooze,
    priorityFilter, setPriorityFilter,
    filteredNotifications,
    counts,
  };
}

// ── useBusPredictive — per-bus data for BusDetailPanel / BusPartsHealthPanel ──

export interface UseBusPredictiveResult {
  records:       PartHealthRecord[];
  criticalCount: number;
  orderNowCount: number;
  avgHealth:     number;
  worstPart:     PartHealthRecord | null;
}

export function useBusPredictive(bus: BusRecord | null): UseBusPredictiveResult {
  const records = useMemo(() => {
    if (!bus) return [];
    // If mock cache has this bus use it; otherwise compute fresh
    const cached = getMockRecordsForBus(bus.alias);
    return cached.length > 0
      ? cached
      : buildBusHealthRecords(bus);
  }, [bus]);

  const criticalCount = records.filter(r => r.healthPct <= 20).length;
  const orderNowCount = records.filter(r => r.tags.some(t => t.key === "order_now")).length;
  const avgHealth     = records.length
    ? Math.round(records.reduce((s, r) => s + r.healthPct, 0) / records.length)
    : 100;
  const worstPart     = records.length
    ? records.reduce((min, r) => r.healthPct < min.healthPct ? r : min)
    : null;

  return { records, criticalCount, orderNowCount, avgHealth, worstPart };
}

// ── usePredictiveAlerts — lightweight hook for the inventory page alert banner ─

export interface UsePredictiveAlertsResult {
  criticalCount: number;
  orderNowCount: number;
  hasCritical:   boolean;
}

export function usePredictiveAlerts(): UsePredictiveAlertsResult {
  const [counts, setCounts] = useState({ critical: 0, orderNow: 0 });

  useEffect(() => {
    const t = setTimeout(() => {
      const summary = getMockPredictiveSummary();
      setCounts({ critical: summary.criticalCount, orderNow: summary.orderNowCount });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return {
    criticalCount: counts.critical,
    orderNowCount: counts.orderNow,
    hasCritical:   counts.critical > 0,
  };
}
