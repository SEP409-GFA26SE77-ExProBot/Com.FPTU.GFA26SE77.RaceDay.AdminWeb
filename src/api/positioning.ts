export type LiveStaffPosition = {
  userId: string;
  name: string;
  roles: string[];
  stations: { id: string; label: string | null }[];
  latitude: number;
  longitude: number;
  capturedAtUtc: string;
};

export type LivePositionFrame<T> = { data: T; serverNowUtc: string };

export function livePositionsUrl(eventId: string) {
  return `/api/backend/api/v1/positioning/events/${encodeURIComponent(eventId)}/positions/live`;
}
