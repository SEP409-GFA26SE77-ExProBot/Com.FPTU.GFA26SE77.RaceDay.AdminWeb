import type {
  CoordinatorMapDistance,
  CoordinatorMapDistanceDto,
  CoordinatorMapEvent,
  CoordinatorMapEventDto,
} from "@/dto/coordinator-map.dto";

const DISTANCE_COLORS = ["#10B981", "#06B6D4", "#8B5CF6", "#F59E0B"];

export function mapCoordinatorDistance(
  distance: CoordinatorMapDistanceDto,
  index: number
): CoordinatorMapDistance {
  const start = distance.checkpoints.find((point) => point.type === "start");
  const finish = distance.checkpoints.find((point) => point.type === "finish");

  return {
    id: distance.id || distance.type,
    type: distance.type,
    name: distance.name,
    distanceKm: distance.distanceKm,
    elevationGainM: distance.elevationGainM ?? 0,
    minElevationM: distance.minElevationM ?? 0,
    maxElevationM: distance.maxElevationM ?? 0,
    runnersCount: distance.runnersCount ?? distance.registeredCount ?? 0,
    color: distance.color || DISTANCE_COLORS[index % DISTANCE_COLORS.length],
    route: distance.leafletPolyline.map(([lat, lng]) => ({ lat, lng })),
    startPoint: {
      lat: start?.lat ?? distance.startLocation.lat,
      lng: start?.lng ?? distance.startLocation.lng,
    },
    finishPoint: {
      lat: finish?.lat ?? distance.finishLocation.lat,
      lng: finish?.lng ?? distance.finishLocation.lng,
    },
    checkpoints: distance.checkpoints,
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
    distances: event.distances.map(mapCoordinatorDistance),
  };
}
