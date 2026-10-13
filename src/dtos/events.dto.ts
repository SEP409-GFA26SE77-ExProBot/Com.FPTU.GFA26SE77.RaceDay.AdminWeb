export interface EventCoordinatesDto {
  lat: number;
  lng: number;
}

export interface BeneficiaryAccountDto {
  accountHolder: string | null;
  accountNumber: string | null;
  bankName: string | null;
  branch: string | null;
  swiftCode: string | null;
  transferNote: string | null;
}

export interface EventOrganizerDto {
  name: string;
  email: string;
  phone: string | null;
  legalEntity?: string | null;
  website?: string | null;
  verified?: boolean;
  beneficiaryAccount?: BeneficiaryAccountDto | null;
}

export interface LocationPointDto {
  name: string;
  lat: number;
  lng: number;
}

export interface DistanceDto {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  elevationGainM?: number | null;
  maxElevationM?: number | null;
  minElevationM?: number | null;
  runnersCount?: number;
  capacity: number;
  registeredCount?: number;
  price: number;
  currency: string;
  color?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  startLocation?: LocationPointDto | null;
  finishLocation?: LocationPointDto | null;
  checkpoints?: unknown[] | null;
  osrmWaypoints?: unknown | null;
  leafletPolyline?: unknown | null;
  geoJson?: unknown | null;
}

export interface EventDocumentDto {
  documentKey: string;
  title: string;
  fileName: string;
  fileUrl: string;
  required: boolean;
}

export interface PendingEventDto {
  id: string;
  name: string;
  tagline?: string | null;
  bannerImage?: string | null;
  location: string;
  coordinates?: EventCoordinatesDto | null;
  date: string;
  status: string;
  organizer: EventOrganizerDto;
  totalRunners: number;
  activeRunners?: number;
  weather?: unknown | null;
  permitDocument?: unknown | null;
  description?: string | null;
  rejectionReason?: string | null;
  startTime?: string | null;
  endDate?: string | null;
  ticketPricing?: unknown | null;
  merchandise?: unknown | null;
  rules?: unknown | null;
  rewards?: unknown | null;
  distances: DistanceDto[];
  documents?: EventDocumentDto[];
  packagePurchaseId?: string | null;
  packageExpiresAtUtc?: string | null;
  registrationOpensAtUtc?: string | null;
  registrationClosesAtUtc?: string | null;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  submittedAt?: string;
}

/**
 * EventListItemDto represents the event item in lists (aliased to PendingEventDto).
 */
export type EventListItemDto = PendingEventDto;

/**
 * List response of pending events returned by GET /api/v1/event/admin/pending
 */
export type PendingEventsResponseDto = PendingEventDto[];

export interface ApproveEventDto {
  openRegistration?: boolean;
}
export type ApproveEventBody = ApproveEventDto;

export interface RejectEventDto {
  reason: string;
}
export type RejectEventBody = RejectEventDto;

export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "registration-open"
  | "closed"
  | "completed"
  | "cancelled"
  | "rejected";

export type DistanceCategory = "5K" | "10K" | "21K" | "42K" | string;
