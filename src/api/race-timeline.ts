import api from "@/config/axios";
import { getApiErrorMessage } from "@/lib/error";

export type RaceEventLogType = "RunnerCheckpointPassed" | (string & {});
export type RaceScanMethod = "RFID" | "Manual";

/** One row of the race timeline (`RaceEventLogDto` / SSE `RaceEventLogCreated`). */
export type RaceEventLog = {
  id: string;
  sequence: number;
  eventId: string;
  eventDistanceId: string | null;
  eventType: RaceEventLogType;
  occurredAtUtc: string;
  recordedAtUtc: string;
  bibNumber: string | null;
  checkpointId: string | null;
  registrationId: string | null;
  sourceType: string | null;
  sourceId: string | null;
  scanMethod: RaceScanMethod | (string & {}) | null;
  /** Missing on logs written before names were stored in metadata. */
  checkpointName?: string | null;
  runnerName?: string | null;
  /** Runner's first pass at a Start checkpoint (chip time origin); null until they passed Start. */
  chipStartAtUtc?: string | null;
  /** Row produced by the organizer race simulator (shown as RFID). */
  simulated?: boolean;
  simulationRunId?: string | null;
};

export type RaceEventLogPage = {
  items: RaceEventLog[];
  total: number;
  page: number;
  pageSize: number;
};

export type RaceEventLogParams = {
  eventDistanceId?: string;
  eventType?: string;
  bibNumber?: string;
  fromUtc?: string;
  toUtc?: string;
  afterSequence?: number;
  page?: number;
  /** Server caps at 100. */
  pageSize?: number;
};

/** SSE event names sent by `/race-logs/stream`. */
export const RACE_LOG_EVENTS = {
  created: "RaceEventLogCreated",
  overrun: "RaceEventLogStreamOverrun",
  accessRevoked: "RaceEventLogAccessRevoked",
  /** { eventId, eventDistanceId, simulationRunId }: drop simulated rows of that distance from other runs. */
  cleared: "RaceEventLogsCleared",
  /** Sent by our own proxy when the backend is down. */
  unavailable: "unavailable",
} as const;

const base = (eventId: string) => `api/v1/race-monitoring/events/${encodeURIComponent(eventId)}/race-logs`;

export async function listRaceEventLogs(eventId: string, params: RaceEventLogParams = {}): Promise<RaceEventLogPage> {
  try {
    return (await api.get(base(eventId), { params })) as RaceEventLogPage;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Không tải được timeline."));
  }
}

/**
 * Newest `limit` logs, oldest first. The list endpoint sorts ascending, so read the
 * total first and then fetch the last page.
 */
export async function listLatestRaceEventLogs(eventId: string, limit = 100): Promise<RaceEventLog[]> {
  const pageSize = Math.min(Math.max(limit, 1), 100);
  const head = await listRaceEventLogs(eventId, { page: 1, pageSize });
  const lastPage = Math.max(1, Math.ceil(head.total / pageSize));
  if (lastPage === 1) return head.items;
  const tail = await listRaceEventLogs(eventId, { page: lastPage, pageSize });
  // Last page can be short; top it up from the page before.
  if (tail.items.length >= pageSize || lastPage < 2) return tail.items;
  const previous = await listRaceEventLogs(eventId, { page: lastPage - 1, pageSize });
  return [...previous.items, ...tail.items].slice(-pageSize);
}

/** Goes through the proxy: `EventSource` cannot send the JWT header. */
export const raceTimelineStreamUrl = (eventId: string) => `/api/backend/${base(eventId)}/stream`;
