import eventsData from "@/events.json";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";

/** Local sample data used until the coordinator map endpoint is available. */
export const COORDINATOR_MAP_EVENTS =
  eventsData as unknown as CoordinatorMapEventDto[];
