import api from "@/config/axios";
import { getApiErrorMessage } from "@/lib/error";

const PHOTO_API = "api/v1/photo";

export type PhotoTagDto = {
  bib: string;
  confidence: number;
  source: string;
  bboxJson?: string | null;
};

export type PhotoListItemDto = {
  id: string;
  eventId: string;
  url: string;
  status: string;
  zone?: string | null;
  tags: PhotoTagDto[];
  createdAtUtc: string;
  discardReason?: string | null;
  isPublished?: boolean;
  publishedAtUtc?: string | null;
};

export type PublishPhotosResultDto = {
  publishedCount: number;
};

/** Map mã kỹ thuật OCR/WebAPI → câu tiếng Việt cho UI (không hiện raw code). */
const DISCARD_REASON_VI: Record<string, string> = {
  photographer_reject: "Photographer reject tay",
  empty_roster: "Giải chưa có danh sách BIB confirmed",
  bib_not_in_roster: "Số đọc được không thuộc BIB của giải",
  no_bib: "Không đọc được BIB trên ảnh",
  no_candidate: "Không có ứng viên BIB",
  no_bib_like_token: "Không có chuỗi giống số BIB",
  no_person_roi: "Không nhận diện được người trên ảnh",
  ignored_watermark_zone: "Bỏ chữ vùng watermark",
  ignored_event_signage: "Bỏ chữ biển/logo giải",
  blur_too_low: "Ảnh quá mờ",
  low_confidence: "Độ tin cậy thấp",
  below_review_min: "Conf dưới ngưỡng review",
  drop_guess: "Không đủ chắc để gắn BIB",
  mixed_confidence_ignored_for_auto: "Có tag chắc + tag yếu (đã ưu tiên tag chắc)",
  yolo_no_ocr_text_in_roi: "Có người nhưng không đọc được chữ trên áo",
  skip_fullframe_ocr: "Không quét full-frame (tránh nhiễu)",
  ocr_fullframe_fallback: "Fallback OCR toàn ảnh",
  failed: "OCR lỗi kỹ thuật",
};

function mapOneDiscardCode(code: string): string {
  const c = code.trim();
  if (!c) return "";
  if (c.startsWith("duplicate")) return "Ảnh trùng (đã có trên giải)";
  if (c.startsWith("decode_or_fetch")) return "Không tải/đọc được file ảnh";
  if (c.startsWith("blur")) return DISCARD_REASON_VI.blur_too_low;
  if (DISCARD_REASON_VI[c]) return DISCARD_REASON_VI[c];
  // Không lộ raw snake_case — gom nhóm còn lại
  if (c.includes("roster")) return DISCARD_REASON_VI.bib_not_in_roster;
  if (c.includes("watermark")) return DISCARD_REASON_VI.ignored_watermark_zone;
  if (c.includes("signage") || c.includes("block"))
    return DISCARD_REASON_VI.ignored_event_signage;
  if (c.includes("person") || c.includes("yolo"))
    return DISCARD_REASON_VI.no_person_roi;
  if (c.includes("blur")) return DISCARD_REASON_VI.blur_too_low;
  return "Loại sau OCR";
}

/** Cờ phụ OCR — không cần hiện khi đã có lý do chính. */
const DISCARD_NOISE_VI = new Set([
  "Bỏ chữ biển/logo giải",
  "Bỏ chữ vùng watermark",
  "Không có ứng viên BIB",
  "Không có chuỗi giống số BIB",
  "Không quét full-frame (tránh nhiễu)",
  "Fallback OCR toàn ảnh",
  "Có tag chắc + tag yếu (đã ưu tiên tag chắc)",
  "Loại sau OCR",
]);

/** Lý do loại — 1 câu chính, bỏ mã phụ thừa. */
export function discardReasonLabel(reason?: string | null): string {
  if (!reason?.trim()) return "Đã loại";
  const parts = reason
    .split(/[,;|]/)
    .map((p) => mapOneDiscardCode(p))
    .filter(Boolean);
  let unique = [...new Set(parts)];
  if (!unique.length) return "Đã loại";

  const priority = [
    "Photographer reject tay",
    "Số đọc được không thuộc BIB của giải",
    "Giải chưa có danh sách BIB confirmed",
    "Ảnh quá mờ",
    "Không nhận diện được người trên ảnh",
    "Có người nhưng không đọc được chữ trên áo",
    "Không đọc được BIB trên ảnh",
    "Ảnh trùng (đã có trên giải)",
    "Không tải/đọc được file ảnh",
    "OCR lỗi kỹ thuật",
  ];

  unique.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const primary = unique.find((p) => priority.includes(p));
  if (primary) return primary;

  // Chỉ còn cờ phụ → lấy 1 cái, bỏ noise nếu có lựa chọn khác
  const meaningful = unique.filter((p) => !DISCARD_NOISE_VI.has(p));
  return (meaningful[0] || unique[0] || "Đã loại");
}

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
    pageSize: d?.pageSize ?? 10,
    total: d?.total ?? 0,
  };
}

const BULK_CHUNK_FILES = 20;
const BULK_CHUNK_BYTES = 40 * 1024 * 1024; // ~40MB / request (an toàn dưới proxy)

function chunkFilesForUpload(files: File[]): File[][] {
  const chunks: File[][] = [];
  let cur: File[] = [];
  let curBytes = 0;
  for (const f of files) {
    const wouldOverflow =
      cur.length > 0 &&
      (cur.length >= BULK_CHUNK_FILES || curBytes + f.size > BULK_CHUNK_BYTES);
    if (wouldOverflow) {
      chunks.push(cur);
      cur = [];
      curBytes = 0;
    }
    cur.push(f);
    curBytes += f.size;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

async function postBulkUploadChunk(
  eventId: string,
  files: File[],
  zone: string | undefined,
  onChunkProgress?: (loaded: number, total: number) => void
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
        timeout: 300_000,
        onUploadProgress: (evt) => {
          if (!onChunkProgress || !evt.total || evt.total <= 0) return;
          onChunkProgress(evt.loaded, evt.total);
        },
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
    const msg = getApiErrorMessage(e, "Upload ảnh thất bại.");
    const axiosMsg = (e as { message?: string })?.message || "";
    if (/network error/i.test(axiosMsg) || /network error/i.test(msg)) {
      throw new Error(
        "Mất kết nối khi upload (request quá lớn hoặc server cắt). Thử lại — hệ thống đã chia lô nhỏ hơn."
      );
    }
    throw new Error(msg);
  }
}

/** Song song tối đa N chunk HTTP (cân bằng tốc độ vs proxy/body limit). */
const UPLOAD_CHUNK_CONCURRENCY = 2;

/** POST multipart bulk upload — chia lô ≤20 file / ~40MB; 2 chunk song song. */
export async function bulkUploadPhotos(
  eventId: string,
  files: File[],
  zone?: string,
  onProgress?: (percent: number) => void
): Promise<BulkUploadResultDto> {
  const chunks = chunkFilesForUpload(files);
  const totalBytes = files.reduce((s, f) => s + f.size, 0) || 1;
  const chunkBytesList = chunks.map((c) => c.reduce((s, f) => s + f.size, 0));
  const loadedByChunk = new Array(chunks.length).fill(0);
  let accepted = 0;
  let skippedDuplicate = 0;
  const photoIds: string[] = [];

  const report = () => {
    const done = loadedByChunk.reduce((a, b) => a + b, 0);
    onProgress?.(Math.min(99, Math.round((done / totalBytes) * 100)));
  };

  const queue = chunks.map((chunk, i) => ({ chunk, i }));
  const workers = Array.from(
    { length: Math.min(UPLOAD_CHUNK_CONCURRENCY, chunks.length) },
    async () => {
      while (queue.length) {
        const job = queue.shift();
        if (!job) break;
        const { chunk, i } = job;
        const chunkBytes = chunkBytesList[i];
        const res = await postBulkUploadChunk(
          eventId,
          chunk,
          zone,
          (loaded, total) => {
            loadedByChunk[i] =
              total > 0 ? (loaded / total) * chunkBytes : 0;
            report();
          }
        );
        accepted += res.accepted ?? 0;
        skippedDuplicate += res.skippedDuplicate ?? 0;
        if (Array.isArray(res.photoIds)) photoIds.push(...res.photoIds);
        loadedByChunk[i] = chunkBytes;
        report();
      }
    }
  );

  await Promise.all(workers);
  onProgress?.(100);
  return { accepted, skippedDuplicate, photoIds };
}

export async function listPhotographerPhotos(
  eventId: string,
  bucket:
    | "pending"
    | "queue"
    | "matched"
    | "ready"
    | "published"
    | "review"
    | "discarded",
  page = 1,
  pageSize = 10
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

/** Publish ảnh đã khớp → runner search được. allReady hoặc photoIds. */
export async function publishPhotos(
  eventId: string,
  opts: { photoIds?: string[]; allReady?: boolean }
): Promise<PublishPhotosResultDto> {
  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/photos/publish`,
      {
        photoIds: opts.photoIds,
        allReady: opts.allReady ?? false,
      }
    )) as PublishPhotosResultDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Publish ảnh thất bại."));
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

export async function discardPhoto(
  eventId: string,
  photoId: string,
  reason?: string
): Promise<PhotoDetailDto> {
  try {
    return (await api.post(
      `${PHOTO_API}/photographer/events/${eventId}/photos/${photoId}/discard`,
      { reason: reason || "photographer_reject" }
    )) as PhotoDetailDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Reject ảnh thất bại."));
  }
}

export async function getPhotographerPhotoDetail(
  eventId: string,
  photoId: string
): Promise<PhotoDetailDto> {
  try {
    return (await api.get(
      `${PHOTO_API}/photographer/events/${eventId}/photos/${photoId}`
    )) as PhotoDetailDto;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Không tải chi tiết ảnh."));
  }
}

/** Display OCR confidence — preserve spread; only avoid literal 100%. */
export function formatConfidence(c: number): string {
  if (!Number.isFinite(c)) return "—";
  let pct = Math.round(Math.max(0, Math.min(1, c)) * 1000) / 10;
  if (pct >= 100) pct = 99.9;
  return `${pct}%`;
}

/** Batch quality from matched / review / discarded counts (processed only). */
export function ocrBatchRates(matched: number, review: number, discarded: number) {
  const processed = matched + review + discarded;
  if (processed <= 0) {
    return { processed: 0, matchPct: 0, reviewPct: 0, rejectPct: 0, estPrecision: 0 };
  }
  const matchPct = Math.round((matched / processed) * 1000) / 10;
  const reviewPct = Math.round((review / processed) * 1000) / 10;
  const rejectPct = Math.round((discarded / processed) * 1000) / 10;
  // Ước lượng precision auto: matched / (matched + review); reject = no-detect, không tính sai số tag.
  const labeled = matched + review;
  const estPrecision =
    labeled > 0 ? Math.round((matched / labeled) * 1000) / 10 : 0;
  return { processed, matchPct, reviewPct, rejectPct, estPrecision };
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
