/**
 * Coordinator map transport and view types.
 * Keep API response changes here and in coordinator-map.mapper.ts so the map UI
 * only depends on the stable view model below.
 */
export type CoordinatorCheckpointType =
  | "start"
  | "finish"
  | "water"
  | "aid"
  | "medical"
  | "cutoff"
  | "checkpoint"
  | (string & {});

export interface CoordinatorMapCheckpointDto {
  id: string;
  name: string;
  km: number;
  lat: number;
  lng: number;
  type: CoordinatorCheckpointType;
  cutoff?: string;
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
  startLocation: { name?: string; lat: number; lng: number };
  finishLocation: { name?: string; lat: number; lng: number };
  checkpoints: CoordinatorMapCheckpointDto[];
  leafletPolyline: [number, number][];
}

/** Current fixture/API shape. Replace this boundary when the coordinator API is finalized. */
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
  elevationGainM: number;
  minElevationM: number;
  maxElevationM: number;
  runnersCount: number;
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
