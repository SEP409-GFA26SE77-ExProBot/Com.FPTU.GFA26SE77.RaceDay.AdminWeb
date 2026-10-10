/** Shape chi tiết giải từ GET /api/v1/event/admin/pending & /{id} — khớp FE User CreateRaceEventRequest. */

export interface GeoPointDto {
  lat: number;
  lng: number;
}

export interface NamedGeoPointDto {
  name: string;
  lat: number;
  lng: number;
}

export interface BeneficiaryAccountDto {
  accountHolder?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  branch?: string | null;
  swiftCode?: string | null;
  transferNote?: string | null;
}

export interface OrganizerDto {
  name: string;
  email: string;
  phone: string;
  legalEntity?: string | null;
  website?: string | null;
  verified?: boolean;
  beneficiaryAccount?: BeneficiaryAccountDto | null;
}

export interface CheckpointDto {
  id: string;
  name: string;
  km: number;
  lat: number;
  lng: number;
  type: string;
  cutoff?: string | null;
  elevation?: number | null;
}

export interface DistanceDto {
  id?: string;
  type: string;
  name: string;
  distanceKm: number;
  elevationGainM?: number;
  maxElevationM?: number;
  minElevationM?: number;
  runnersCount?: number;
  capacity?: number;
  registeredCount?: number;
  price?: number;
  currency?: string;
  color?: string;
  startLocation?: NamedGeoPointDto;
  finishLocation?: NamedGeoPointDto;
  checkpoints?: CheckpointDto[] | null;
  leafletPolyline?: [number, number][] | null;
  osrmWaypoints?: unknown;
  geoJson?: unknown;
}

export interface EventDocumentDto {
  documentKey: string;
  title: string;
  fileName?: string | null;
  fileUrl?: string | null;
  required: boolean;
}

export interface SafetyChecklistItem {
  label?: string;
  checked?: boolean;
}

/** rules JSON từ FE User EventPermitRegistration */
export interface EventRulesDto {
  safetyChecklist?: SafetyChecklistItem[];
  authorityContact?: string;
  medicalPartner?: string;
  securityPosts?: string | number;
  aidStations?: string | number;
  contactName?: string;
  settlementNote?: string;
}

export interface WeatherDto {
  temp?: string;
  condition?: string;
  humidity?: string;
}

export interface RaceEventDto {
  id: string;
  name: string;
  tagline?: string | null;
  bannerImage?: string | null;
  location: string;
  coordinates?: GeoPointDto | null;
  date: string;
  startTime?: string | null;
  description?: string | null;
  status: string;
  organizer: OrganizerDto;
  totalRunners?: number;
  activeRunners?: number;
  weather?: WeatherDto | null;
  distances: DistanceDto[];
  documents?: EventDocumentDto[] | null;
  rules?: EventRulesDto | Record<string, unknown> | null;
  rejectionReason?: string | null;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export function parseEventRules(
  rules: RaceEventDto["rules"]
): EventRulesDto {
  if (!rules || typeof rules !== "object") return {};
  return rules as EventRulesDto;
}

/** Map mock events.json / partial API → RaceEventDto (home demo vẫn mở được modal). */
export function coerceRaceEvent(raw: unknown): RaceEventDto {
  const e = (raw || {}) as Record<string, unknown>;
  const org = (e.organizer || {}) as Record<string, unknown>;
  const distances = Array.isArray(e.distances) ? e.distances : [];
  return {
    id: String(e.id ?? ""),
    name: String(e.name ?? "—"),
    tagline: (e.tagline as string) ?? null,
    bannerImage: (e.bannerImage as string) ?? null,
    location: String(e.location ?? ""),
    coordinates: (e.coordinates as RaceEventDto["coordinates"]) ?? null,
    date: String(e.date ?? ""),
    startTime: (e.startTime as string) ?? null,
    description: (e.description as string) ?? null,
    status: String(e.status ?? "pending"),
    organizer: {
      name: String(org.name ?? "—"),
      email: String(org.email ?? ""),
      phone: String(org.phone ?? ""),
      legalEntity: (org.legalEntity as string) ?? null,
      website: (org.website as string) ?? null,
      verified: Boolean(org.verified),
      beneficiaryAccount:
        (org.beneficiaryAccount as OrganizerDto["beneficiaryAccount"]) ?? null,
    },
    totalRunners: Number(e.totalRunners ?? 0),
    activeRunners: Number(e.activeRunners ?? 0),
    weather: (e.weather as RaceEventDto["weather"]) ?? null,
    distances: distances as DistanceDto[],
    documents: (e.documents as EventDocumentDto[]) ?? null,
    rules: (e.rules as RaceEventDto["rules"]) ?? null,
  };
}
