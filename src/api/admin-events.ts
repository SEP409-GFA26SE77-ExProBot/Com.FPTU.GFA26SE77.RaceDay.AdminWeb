import api from "@/config/axios";
import { RaceEventDto } from "@/dto/event.dto";

/** Manager event review — BE prefix /api/v1/event/manager */
const MANAGER_EVENT_API = "api/v1/event/manager";

/** GET /api/v1/event/manager/pending */
export async function listPendingEvents(): Promise<RaceEventDto[]> {
  const data = await api.get(`${MANAGER_EVENT_API}/pending`);
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/event/manager/{id} */
export async function getAdminEventById(
  eventId: string
): Promise<RaceEventDto> {
  return api.get(`${MANAGER_EVENT_API}/${eventId}`);
}

/**
 * POST /api/v1/event/manager/{id}/approve
 * openRegistration false → approved (Sắp mở); true → registration-open (Đang mở)
 */
export async function approveEvent(
  eventId: string,
  openRegistration = false
): Promise<RaceEventDto> {
  return api.post(`${MANAGER_EVENT_API}/${eventId}/approve`, {
    openRegistration,
  });
}

/** POST /api/v1/event/manager/{id}/reject */
export async function rejectEvent(
  eventId: string,
  reason: string
): Promise<RaceEventDto> {
  return api.post(`${MANAGER_EVENT_API}/${eventId}/reject`, { reason });
}
