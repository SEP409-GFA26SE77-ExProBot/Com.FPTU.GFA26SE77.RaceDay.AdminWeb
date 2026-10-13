export interface DistanceDto {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  price: number;
  currency: string;
  capacity: number;
  color?: string;
}

export interface EventOrganizerDto {
  name: string;
  email: string;
  phone?: string;
}

export interface EventListItemDto {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  totalRunners: number;
  bannerImage?: string;
  organizer: EventOrganizerDto;
  distances: DistanceDto[];
  submittedAt?: string;
}

export interface ApproveEventDto {
  openRegistration?: boolean;
}

export type ApproveEventBody = ApproveEventDto;

export interface RejectEventDto {
  reason: string;
}

export type RejectEventBody = RejectEventDto;
