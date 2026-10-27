/** Course từ Map module — khớp User FE race-map.dto */

export type CheckpointType =
  | "start"
  | "cp"
  | "aid"
  | "finish"
  | "water"
  | "medical"
  | "cutoff";

export interface LatLngDto {
  lat: number;
  lng: number;
}

export interface RaceCheckpointDto {
  id: string;
  name: string;
  km: number;
  lat: number;
  lng: number;
  type: CheckpointType;
  cutoff?: string | null;
}

export interface CourseConfigDto {
  title: string;
  distanceId?: string | null;
  distanceKm: number;
  waypoints: LatLngDto[];
  polyline: LatLngDto[];
  checkpoints: RaceCheckpointDto[];
  updatedAt: string;
}
