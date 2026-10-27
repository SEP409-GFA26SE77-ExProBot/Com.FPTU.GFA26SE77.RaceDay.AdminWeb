import eventsData from "@/events.json";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";

/** Legacy sample data; the coordinator map now loads live assignments and courses. */
export const COORDINATOR_MAP_EVENTS =
  eventsData as unknown as CoordinatorMapEventDto[];
