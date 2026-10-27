import api from "@/config/axios";
import type { BulkUploadResult, PagedPhotos, PhotoBucket, PhotoDetail, PhotoDispute } from "@/dto/photo.dto";

const PHOTO_API = "api/v1/photo";
const eventPath = (eventId: string) => `${PHOTO_API}/photographer/events/${encodeURIComponent(eventId)}`;

export function listPhotographerPhotos(eventId: string, bucket: PhotoBucket, page = 1, pageSize = 24) {
  return api.get<PagedPhotos, PagedPhotos>(`${eventPath(eventId)}/photos/${bucket}`, { params: { page, pageSize } });
}

export function bulkUploadPhotos(eventId: string, files: File[], zone: string, onProgress?: (loaded: number, total?: number) => void) {
  const body = new FormData();
  for (const file of files) body.append("files", file, file.name);
  if (zone.trim()) body.append("zone", zone.trim());
  return api.post<BulkUploadResult, BulkUploadResult>(`${eventPath(eventId)}/photos/bulk-upload`, body, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
    onUploadProgress: (event) => onProgress?.(event.loaded, event.total),
  });
}

export function processPendingPhotos(eventId: string) {
  return api.post<{ queuedCount: number }, { queuedCount: number }>(`${eventPath(eventId)}/photos/process`, {});
}

export function correctPhotoBib(eventId: string, photoId: string, bib: string) {
  return api.patch<PhotoDetail, PhotoDetail>(`${eventPath(eventId)}/photos/${encodeURIComponent(photoId)}`, { bib: bib.trim().toUpperCase() });
}

export function listPhotoDisputes(eventId: string) {
  return api.get<PhotoDispute[], PhotoDispute[]>(`${eventPath(eventId)}/disputes`);
}

export function approvePhotoDispute(eventId: string, disputeId: string) {
  return api.post<PhotoDispute, PhotoDispute>(`${eventPath(eventId)}/disputes/${encodeURIComponent(disputeId)}/approve`, {});
}

export function rejectPhotoDispute(eventId: string, disputeId: string, reason: string) {
  return api.post<PhotoDispute, PhotoDispute>(`${eventPath(eventId)}/disputes/${encodeURIComponent(disputeId)}/reject`, { reason: reason.trim() });
}

export function getPhotoDetail(photoId: string) {
  return api.get<PhotoDetail, PhotoDetail>(`${PHOTO_API}/photos/${encodeURIComponent(photoId)}`);
}

export function searchPhotosByBib(eventId: string, bib: string, page = 1, pageSize = 24) {
  return api.get<PagedPhotos, PagedPhotos>(`${PHOTO_API}/photos`, { params: { eventId, bib: bib.trim().toUpperCase(), page, pageSize } });
}
