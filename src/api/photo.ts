import api from "@/config/axios";
import { getApiErrorMessage } from "@/lib/error";

const PHOTO_API = "api/v1/photo";

export type PhotoTagDto = {
  bib: string;
  confidence: number;
  source: string;
};

export type PhotoListItemDto = {
  id: string;
  eventId: string;
  url: string;
  status: string;
  zone?: string | null;
  tags: PhotoTagDto[];
  createdAtUtc: string;
};

export type PhotoDetailDto = PhotoListItemDto & {
  originalFileName?: string | null;
  discardReason?: string | null;
  updatedAtUtc: string;
};

export type PagedPhotosDto = {
  items: PhotoListItemDto[];
  page: number;
  pageSize: number;
  total: number;
};

export type BulkUploadResultDto = {
  accepted: number;
  skippedDuplicate: number;
  photoIds: string[];
};

export type ProcessPhotosResultDto = {
  queuedCount: number;
};

export type PhotoDisputeDto = {
  id: string;
  photoId: string;
  eventId: string;
  reporterUserId: string;
  reason: string;
  status: string;
  reviewNote?: string | null;
  createdAtUtc: string;
  reviewedAtUtc?: string | null;
};

function asPaged(data: unknown): PagedPhotosDto {
  const d = data as Partial<PagedPhotosDto> | null;
  return {
    items: Array.isArray(d?.items) ? d!.items! : [],
    page: d?.page ?? 1,
    pageSize: d?.pageSize ?? 50,
    total: d?.total ?? 0,
  };
}

/** POST multipart bulk upload — field files + optional zone */
export async function bulkUploadPhotos(
  eventId: string,
  files: File[],
  zone?: string
): Promise<BulkUploadResultDto> {
  const form = new FormData();
  for (const f of files) {
    form.append("files", f);
  }
  if (zone?.trim()) {
    form.append("zone", zone.trim());
  }

  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/photos/bulk-upload`,
      form,
      {
        timeout: 180_000,
        transformRequest: [
          (data, headers) => {
            if (typeof FormData !== "undefined" && data instanceof FormData) {
              delete (headers as Record<string, unknown>)["Content-Type"];
            }
            return data;
          },
        ],
      }
    )) as BulkUploadResultDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Upload ảnh thất bại."));
  }
}

export async function listPhotographerPhotos(
  eventId: string,
  bucket: "pending" | "matched" | "review",
  page = 1,
  pageSize = 50
): Promise<PagedPhotosDto> {
  try {
    const data = await api.get(
      `${PHOTO_API}/photographer/events/${eventId}/photos/${bucket}`,
      { params: { page, pageSize } }
    );
    return asPaged(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Không tải được danh sách ảnh."));
  }
}

export async function processPendingPhotos(
  eventId: string
): Promise<ProcessPhotosResultDto> {
  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/photos/process`
    )) as ProcessPhotosResultDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Không enqueue OCR được."));
  }
}

export async function correctPhotoBib(
  eventId: string,
  photoId: string,
  bib: string
): Promise<PhotoDetailDto> {
  try {
    return (await api.patch(
      `${PHOTO_API}/photographer/events/${eventId}/photos/${photoId}`,
      { bib }
    )) as PhotoDetailDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Sửa BIB thất bại."));
  }
}

export async function listOpenEventDisputes(
  eventId: string
): Promise<PhotoDisputeDto[]> {
  try {
    const data = await api.get(
      `${PHOTO_API}/photographer/events/${eventId}/disputes`
    );
    return Array.isArray(data) ? (data as PhotoDisputeDto[]) : [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Không tải được khiếu nại."));
  }
}

export async function approveDispute(
  eventId: string,
  disputeId: string
): Promise<PhotoDisputeDto> {
  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/disputes/${disputeId}/approve`
    )) as PhotoDisputeDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Duyệt khiếu nại thất bại."));
  }
}

export async function rejectDispute(
  eventId: string,
  disputeId: string,
  reason: string
): Promise<PhotoDisputeDto> {
  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/disputes/${disputeId}/reject`,
      { reason }
    )) as PhotoDisputeDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Từ chối khiếu nại thất bại."));
  }
}

export function primaryBib(photo: PhotoListItemDto): string {
  if (!photo.tags?.length) return "—";
  const best = [...photo.tags].sort((a, b) => b.confidence - a.confidence)[0];
  return best?.bib || "—";
}

export function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ OCR";
    case "queued":
      return "Hàng đợi";
    case "processing":
      return "Đang OCR";
    case "matched":
      return "Đã khớp";
    case "needs_review":
      return "Cần review";
    case "manual_corrected":
      return "Đã sửa tay";
    case "runner_reported":
      return "Runner báo";
    case "failed":
      return "Lỗi";
    case "discarded":
      return "Loại";
    default:
      return status;
  }
}
