import { BASE_URL } from "@/config/global-config";

/**
 * BE Local: `/uploads/{folder}/{file}` phục vụ qua API static.
 * BE R2: `{Storage:PublicBaseUrl}/{folder}/{file}` (không có prefix /uploads).
 *
 * Một số hồ sơ trong DB bị lưu nhầm host API (`http://localhost:5080/event-docs/...`)
 * trong khi object thật nằm trên R2 public — rewrite sang CDN khi mở.
 */
const STORAGE_PUBLIC = (
  process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL || ""
).replace(/\/$/, "");

const STORAGE_FOLDER =
  /^\/(?:uploads\/)?(event-docs|event-banners|health-certs|event-photos)\/(.+)$/i;

export function absoluteFileUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl) || fileUrl.startsWith("blob:")) {
    return fileUrl;
  }
  const base = (BASE_URL || "").replace(/\/$/, "");
  if (!base) return fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${base}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

/** Đưa URL file về chỗ object thật (R2 public / API local). */
export function resolveStoredFileUrl(fileUrl: string): string {
  if (!fileUrl || fileUrl.startsWith("blob:")) return fileUrl || "";

  const abs = absoluteFileUrl(fileUrl);
  if (!STORAGE_PUBLIC) return abs;

  try {
    const u = new URL(abs);
    const match = u.pathname.match(STORAGE_FOLDER);
    if (!match) return abs;

    const folder = match[1];
    const rest = match[2];
    const onApiHost =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      (BASE_URL && u.origin === BASE_URL.replace(/\/$/, ""));

    // Đã đúng CDN thì giữ nguyên
    if (u.origin === STORAGE_PUBLIC) return abs;
    // Host API / relative absolutized sai → chuyển sang PublicBaseUrl R2
    if (onApiHost) {
      return `${STORAGE_PUBLIC}/${folder}/${rest}`;
    }
  } catch {
    /* keep abs */
  }
  return abs;
}

/** URL mở trên browser Admin — chỉ proxy khi vẫn còn trên API local. */
export function mediaOpenUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("blob:")) return fileUrl;

  const resolved = resolveStoredFileUrl(fileUrl);
  try {
    const host = new URL(resolved).hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `/api/media?u=${encodeURIComponent(resolved)}`;
    }
  } catch {
    /* keep */
  }
  return resolved;
}
