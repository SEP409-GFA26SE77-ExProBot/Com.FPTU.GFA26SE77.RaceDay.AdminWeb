import api from "@/config/axios";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";
/** Event/distance metadata only; geometry is loaded separately from the Map API. */
export async function getCoordinatorMapEvent(eventId: string): Promise<CoordinatorMapEventDto> {
  return api.get<CoordinatorMapEventDto, CoordinatorMapEventDto>(
    `api/v1/event/${encodeURIComponent(eventId)}`
  );
}
