import api from "@/config/axios";
import type { CourseConfigDto } from "@/dto/race-map.dto";

const MAP_API = "api/v1/map";

export async function getEventCourse(
  eventId: string,
  distanceId: string
): Promise<CourseConfigDto> {
  return api.get(
    `${MAP_API}/events/${eventId}/distances/${distanceId}/course`
  ) as Promise<CourseConfigDto>;
}

export async function hasEventCourse(
  eventId: string,
  distanceId: string
): Promise<boolean> {
  try {
    const c = await getEventCourse(eventId, distanceId);
    return Boolean(c?.polyline && c.polyline.length >= 2 && c.distanceKm > 0);
  } catch {
    return false;
  }
}

export function courseHasRoute(c: CourseConfigDto | null | undefined): boolean {
  return Boolean(c?.polyline && c.polyline.length >= 2);
}
