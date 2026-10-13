import { BASE_ENDPOINT } from "@/config/axios";
import { api } from "./client";
import type {
  EventListItemDto,
  PendingEventDto,
  ApproveEventBody,
  RejectEventBody,
} from "@/dtos";

// Re-export DTOs for convenience
export * from "@/dtos/events.dto";

/**
 * GET /api/v1/event/admin/pending
 * Fetch all events waiting for administrator approval (returns list of PendingEventDto)
 */
export async function getPendingEvents(): Promise<PendingEventDto[]> {
  return api.get<PendingEventDto[]>(`${BASE_ENDPOINT}/event/admin/pending`);
}

/**
 * GET /api/v1/event/admin/:id
 * Fetch detailed event information by ID for admin review
 */
export async function getEventById(eventId: string): Promise<EventListItemDto> {
  return api.get<EventListItemDto>(`${BASE_ENDPOINT}/event/admin/${eventId}`);
}

/**
 * POST /api/v1/event/admin/:id/approve
 * Approve a pending event application
 */
export async function approveEvent(
  eventId: string,
  openRegistration = false
): Promise<void> {
  const body: ApproveEventBody = { openRegistration };
  return api.post<void>(`${BASE_ENDPOINT}/event/admin/${eventId}/approve`, body);
}

/**
 * POST /api/v1/event/admin/:id/reject
 * Reject a pending event application with a reason
 */
export async function rejectEvent(
  eventId: string,
  reason: string
): Promise<void> {
  const body: RejectEventBody = { reason };
  return api.post<void>(`${BASE_ENDPOINT}/event/admin/${eventId}/reject`, body);
}

/**
 * GET /api/v1/event
 * List all public published events (no authentication required)
 */
export async function getPublicEvents(): Promise<EventListItemDto[]> {
  return api.get<EventListItemDto[]>(`${BASE_ENDPOINT}/event`);
}

/**
 * Compatibility object for admin event operations
 */
export const adminEventApi = {
  listPending: getPendingEvents,
  getEvent: getEventById,
  approveEvent,
  rejectEvent,
  listPublicEvents: getPublicEvents,
};