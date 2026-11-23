export type PhotoStatus = "pending" | "queued" | "processing" | "matched" | "needs_review" | "manual_corrected" | "discarded" | "failed" | "runner_reported";
export type PhotoBucket = "pending" | "matched" | "review";

export interface PhotoTag {
  bib: string;
  confidence: number;
  source: "ocr" | "manual";
}

export interface PhotoListItem {
  id: string;
  eventId: string;
  url: string;
  status: PhotoStatus;
  zone: string | null;
  tags: PhotoTag[];
  createdAtUtc: string;
}

export interface PhotoDetail extends PhotoListItem {
  originalFileName: string | null;
  discardReason: string | null;
  updatedAtUtc: string;
}

export interface PagedPhotos {
  items: PhotoListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BulkUploadResult {
  accepted: number;
  skippedDuplicate: number;
  photoIds: string[];
}

export interface PhotoDispute {
  id: string;
  photoId: string;
  eventId: string;
  reporterUserId: string;
  reason: string;
  status: "open" | "approved" | "rejected";
  reviewNote: string | null;
  createdAtUtc: string;
  reviewedAtUtc: string | null;
}
