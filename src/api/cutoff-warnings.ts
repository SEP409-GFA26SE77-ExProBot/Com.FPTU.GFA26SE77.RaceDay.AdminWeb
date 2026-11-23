import api from "@/config/axios";

export type CutoffWarningStatus = "Active" | "Resolved" | "Dismissed";
export type CutoffWarningStatusFilter = CutoffWarningStatus | "All";

export type CutoffWarning = {
  id: string;
  eventId: string;
  eventName: string;
  distanceId: string;
  distanceName: string;
  registrationId: string;
  bibNumber: string;
  runnerName: string;
  /** "Warning" while active, otherwise "Cleared". */
  runnerStatus: "Warning" | "Cleared";
  checkpointId: string;
  checkpointName: string;
  checkpointKm: number;
  cutoffAtUtc: string;
  lastCheckpointId: string | null;
  lastCheckpointName: string | null;
  lastPassedAtUtc: string | null;
  detectedAtUtc: string;
  status: CutoffWarningStatus;
  resolution: "PassedCheckpoint" | "PassedLaterCheckpoint" | "RunnerStatusChanged" | null;
  resolvedAtUtc: string | null;
  dismissedAtUtc: string | null;
  dismissalNote: string | null;
};

export type CutoffWarningEvent = { eventId: string; eventName: string; activeCount: number; totalCount: number };

export type CutoffWarningList = {
  items: CutoffWarning[];
  total: number;
  page: number;
  pageSize: number;
  events: CutoffWarningEvent[];
};

export type CutoffWarningPassage = {
  scanId: string;
  checkpointId: string;
  checkpointName: string;
  scannedAtUtc: string;
  scanMethod: "RFID" | "Manual";
};

export type CutoffWarningPassages = {
  warning: CutoffWarning;
  last: CutoffWarningPassage | null;
  passages: CutoffWarningPassage[];
};

export type CutoffWarningNotification = {
  kind: "CutoffWarningRaised" | "CutoffWarningResolved" | "CutoffWarningDismissed";
  warningId: string;
  eventId: string;
  eventName: string;
  registrationId: string;
  bibNumber: string;
  runnerName: string;
  checkpointId: string;
  checkpointName: string;
  cutoffAtUtc: string;
  status: CutoffWarningStatus;
  occurredAtUtc: string;
};

const base = "api/v1/race-monitoring/cutoff-warnings";

export const listCutoffWarnings = (params: {
  eventId?: string;
  status?: CutoffWarningStatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<CutoffWarningList> => api.get(base, { params });

export const getCutoffWarningPassages = (id: string): Promise<CutoffWarningPassages> =>
  api.get(`${base}/${encodeURIComponent(id)}/passages`);

export const dismissCutoffWarning = (id: string, note?: string): Promise<CutoffWarning> =>
  api.post(`${base}/${encodeURIComponent(id)}/dismiss`, { note: note?.trim() || null });

export const cutoffWarningStreamUrl = () => `/api/backend/${base}/stream`;
