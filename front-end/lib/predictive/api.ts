import { getMockBuses } from "@/lib/mockData";
import {
  getMockPartHealthRecords,
  getMockPredictiveSummary,
  getMockRecordsForBus,
} from "@/lib/predictive/mockPredictiveData";
import type {
  PartHealthRecord,
  PredictiveFleetSummary,
  PredictiveNotification,
} from "@/lib/types/predictive";

export interface PredictiveFleetResponse {
  generatedAt: string;
  records: PartHealthRecord[];
  notifications: PredictiveNotification[];
  summary: PredictiveFleetSummary;
}

export interface PredictiveBusResponse {
  generatedAt: string;
  alias: string;
  records: PartHealthRecord[];
}

const EMPTY_NOTIFICATIONS: PredictiveNotification[] = [];

export function getPredictiveFleetResponse(): PredictiveFleetResponse {
  return {
    generatedAt: new Date().toISOString(),
    records: getMockPartHealthRecords(),
    notifications: EMPTY_NOTIFICATIONS,
    summary: getMockPredictiveSummary(),
  };
}

export function getPredictiveBusResponse(
  alias: string,
): PredictiveBusResponse | null {
  const normalizedAlias = alias.trim();
  const busExists = getMockBuses().some((bus) => bus.alias === normalizedAlias);

  if (!busExists) {
    return null;
  }

  return {
    generatedAt: new Date().toISOString(),
    alias: normalizedAlias,
    records: getMockRecordsForBus(normalizedAlias),
  };
}
