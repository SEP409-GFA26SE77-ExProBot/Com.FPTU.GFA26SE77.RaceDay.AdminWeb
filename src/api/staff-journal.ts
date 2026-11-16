import api from "@/config/axios";

export type StaffJournalEntry = {
  id: string; sequence: number; runId: string; checkpointId: string; kind: string;
  actorId: string; actorName: string; actorRole: string;
  registrationId: string | null; bib: string | null; fullName: string | null;
  occurredAtUtc: string; simSeconds: number | null; previousStatus: string | null;
  status: string | null; reason: string | null; evidence: string | null; decisionId: string | null;
};
export type StaffJournalRun = { runId: string; lastOccurredAtUtc: string };
export type StaffJournalPage = { items: StaffJournalEntry[]; nextCursor: number | null };
const base = (eventId: string) => `api/v1/simulation/staff/events/${eventId}/checkpoint/history`;
export const getStaffJournalRuns = (eventId: string): Promise<StaffJournalRun[]> => api.get(`${base(eventId)}/runs`);
export const getStaffJournal = (eventId: string, params: {
  runId: string; kind?: string; search?: string; mine?: boolean; cursor?: number;
}): Promise<StaffJournalPage> => api.get(base(eventId), { params });
