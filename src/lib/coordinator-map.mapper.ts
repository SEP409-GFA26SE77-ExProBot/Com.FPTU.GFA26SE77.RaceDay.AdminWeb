import type {
  CoordinatorMapDistance,
  CoordinatorMapDistanceDto,
  CoordinatorMapEvent,
  CoordinatorMapEventDto,
} from "@/dto/coordinator-map.dto";
import type { CourseConfigDto } from "@/dto/race-map.dto";
import { courseToRoute } from "@/lib/race-map.mapper";

const DISTANCE_COLORS = ["#10B981", "#06B6D4", "#8B5CF6", "#F59E0B"];

export function mapCoordinatorDistance(
  distance: CoordinatorMapDistanceDto,
  index: number,
  course: CourseConfigDto | null = null
): CoordinatorMapDistance {
  const checkpoints = course?.checkpoints ?? [];
  const route = courseToRoute(course);
  const start = checkpoints.find((point) => point.type === "start")
    ?? route[0] ?? course?.waypoints[0] ?? distance.startLocation;
  const finish = checkpoints.find((point) => point.type === "finish")
    ?? route[route.length - 1] ?? course?.waypoints[course.waypoints.length - 1]
    ?? distance.finishLocation;

  return {
    id: distance.id || distance.type,
    type: distance.type,
    name: course?.title || distance.name,
    distanceKm: course?.distanceKm ?? distance.distanceKm,
    elevationGainM: distance.elevationGainM ?? null,
    minElevationM: distance.minElevationM ?? null,
    maxElevationM: distance.maxElevationM ?? null,
    runnersCount: distance.runnersCount ?? distance.registeredCount ?? null,
    color: distance.color || DISTANCE_COLORS[index % DISTANCE_COLORS.length],
    route,
    startPoint: {
      lat: start?.lat ?? 0,
      lng: start?.lng ?? 0,
    },
    finishPoint: {
      lat: finish?.lat ?? 0,
      lng: finish?.lng ?? 0,
    },
    checkpoints,
  };
}

export function mapCoordinatorEvent(
  event: CoordinatorMapEventDto
): CoordinatorMapEvent {
  return {
    id: event.id,
    name: event.name,
    location: event.location,
    status: event.status ?? "scheduled",
    distances: event.distances.map((distance, index) => mapCoordinatorDistance(distance, index)),
  };
}
