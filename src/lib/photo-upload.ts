export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
export const MAX_PHOTO_FILES = 500;
const supportedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function validatePhotoFiles(files: Pick<File, "name" | "size" | "type">[]): string | null {
  if (!files.length) return "Chọn ít nhất một ảnh.";
  if (files.length > MAX_PHOTO_FILES) return "Tối đa 500 ảnh mỗi lần tải.";
  for (const file of files) {
    if (!supportedTypes.has(file.type.toLowerCase())) return `${file.name}: chỉ hỗ trợ JPG, PNG hoặc WebP.`;
    if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) return `${file.name}: ảnh phải lớn hơn 0 byte và không vượt quá 25 MB.`;
  }
  return null;
}

/** Keep multipart requests below the API's default request-body limit. */
export function photoUploadBatches<T extends { size: number }>(files: T[]): T[][] {
  const batches: T[][] = [];
  let batch: T[] = [], bytes = 0;
  for (const file of files) {
    if (batch.length && bytes + file.size > MAX_PHOTO_BYTES) {
      batches.push(batch);
      batch = [];
      bytes = 0;
    }
    batch.push(file);
    bytes += file.size;
  }
  if (batch.length) batches.push(batch);
  return batches;
}
