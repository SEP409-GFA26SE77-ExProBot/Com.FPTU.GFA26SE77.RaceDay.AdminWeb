import api from "@/config/axios";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";
import { COORDINATOR_MAP_EVENTS } from "./coordinator-map.mock";

const COORDINATOR_MAP_API = "api/v1/coordinator/map";

/**
 * Fetch the event and courses shown on the coordinator map.
 * Fixture mode is on by default; set NEXT_PUBLIC_COORDINATOR_MAP_USE_MOCK=false
 * when the API endpoint and its response contract are ready.
 */
export async function getCoordinatorMapEvent(): Promise<CoordinatorMapEventDto> {
  if (process.env.NEXT_PUBLIC_COORDINATOR_MAP_USE_MOCK !== "false") {
    const event =
      COORDINATOR_MAP_EVENTS.find((item) => item.status === "live") ??
      COORDINATOR_MAP_EVENTS[0];
    if (!event) throw new Error("No coordinator map fixture is available.");
    return event;
  }

  return api.get(COORDINATOR_MAP_API) as Promise<CoordinatorMapEventDto>;
}
