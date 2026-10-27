import type { Checkpoint, Coordinate } from "@/components/sections/RaceRouteMap";
import type { CourseConfigDto } from "@/dto/race-map.dto";

export function courseCheckpointType(type: string): NonNullable<Checkpoint["type"]> {
  switch (type) {
    case "water": return "WATER";
    case "medical": return "MEDICAL";
    case "aid": return "AID";
    case "cp":
    case "cutoff": return "TIMING";
    default: return "CHECKPOINT";
  }
}

export function courseToRoute(course: CourseConfigDto | null): Coordinate[] {
  return (course?.polyline ?? []).filter(
    (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)
  );
}

export function courseToCheckpoints(course: CourseConfigDto | null): Checkpoint[] {
  return (course?.checkpoints ?? [])
    .filter((point) => point.type !== "start" && point.type !== "finish")
    .map((point) => ({
      id: point.id,
      name: point.name,
      latitude: point.lat,
      longitude: point.lng,
      distanceFromStart: point.km * 1000,
      type: courseCheckpointType(point.type),
      description: point.cutoff ? `Cutoff: ${point.cutoff}` : undefined,
    }));
}
