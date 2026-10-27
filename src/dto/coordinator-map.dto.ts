import type { RaceCheckpointDto } from "@/dto/race-map.dto";

/**
 * Coordinator map transport and view types.
 * Keep API response changes here and in coordinator-map.mapper.ts so the map UI
 * only depends on the stable view model below.
 */
export interface CoordinatorMapCheckpointDto extends RaceCheckpointDto {
  elevation?: number;
}

export interface CoordinatorMapDistanceDto {
  id?: string;
  type: string;
  name: string;
  distanceKm: number;
  elevationGainM?: number;
  maxElevationM?: number;
  minElevationM?: number;
  runnersCount?: number;
  registeredCount?: number;
  color?: string;
  startLocation?: { name?: string; lat: number; lng: number };
  finishLocation?: { name?: string; lat: number; lng: number };
}

/** Metadata from GET /api/v1/event/{eventId}. */
export interface CoordinatorMapEventDto {
  id: string;
  name: string;
  location: string;
  date?: string;
  status?: string;
  totalRunners?: number;
  activeRunners?: number;
  distances: CoordinatorMapDistanceDto[];
}

export interface CoordinatorMapDistance {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  elevationGainM: number | null;
  minElevationM: number | null;
  maxElevationM: number | null;
  runnersCount: number | null;
  color: string;
  route: Array<{ lat: number; lng: number }>;
  startPoint: { lat: number; lng: number };
  finishPoint: { lat: number; lng: number };
  checkpoints: CoordinatorMapCheckpointDto[];
}

export interface CoordinatorMapEvent {
  id: string;
  name: string;
  location: string;
  status: string;
  distances: CoordinatorMapDistance[];
}
