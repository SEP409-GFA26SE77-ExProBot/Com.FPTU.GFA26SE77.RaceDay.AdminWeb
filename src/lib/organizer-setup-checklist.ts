/**
 * Checklist hồ sơ organizer (khớp User FE ProfileOpenRegClient)
 * — dùng cho màn admin xem xét duyệt.
 */

import type { RaceEventDto, TicketPricingDto } from "@/dto/event.dto";

export const REQUIRED_DOC_KEYS = [
  "official-letter",
  "security",
] as const;

export type SetupCheckId =
  | "basic"
  | "organizer"
  | "bank"
  | "distances"
  | "pricing"
  | "docs"
  | "map";

export type SetupCheckItem = {
  id: SetupCheckId;
  label: string;
  required: boolean;
  ok: boolean;
  summary: string;
};

export type ChecklistMapHint = {
  /** Ít nhất 1 cự ly có course polyline (Map API) */
  mapOk?: boolean;
  /** VD: "1/3 cự ly có cung đường" */
  mapSummary?: string;
};

function hasPricing(event: RaceEventDto): boolean {
  const raw = event.ticketPricing as TicketPricingDto | undefined;
  if (
    raw?.phases?.some((p) =>
      Object.values(p.pricesByDistanceName || {}).some((v) => Number(v) > 0)
    )
  ) {
    return true;
  }
  if (raw?.byDistanceName) {
    for (const row of Object.values(raw.byDistanceName)) {
      if (Number(row?.basePrice) > 0) return true;
      if (row?.phases?.some((p) => Number(p.price) > 0)) return true;
    }
  }
  return (event.distances || []).some((d) => Number(d.price) > 0);
}

function isNonEmptyRoute(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length >= 2;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t || t === "{}" || t === "[]" || t === "null") return false;
    try {
      return isNonEmptyRoute(JSON.parse(t));
    } catch {
      return t.length > 8;
    }
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.coordinates) && o.coordinates.length > 0) return true;
    if (Array.isArray(o.features) && o.features.length > 0) return true;
    if (Array.isArray(o.points) && o.points.length >= 2) return true;
    return Object.keys(o).length > 0;
  }
  return false;
}

/** Fallback khi chưa gọi Map API — field gắn trên distance (thường trống). */
export function distanceHasRoute(event: RaceEventDto): boolean {
  return (event.distances || []).some(
    (d) =>
      isNonEmptyRoute(d.leafletPolyline) ||
      isNonEmptyRoute(d.geoJson) ||
      isNonEmptyRoute(d.osrmWaypoints)
  );
}

export function requiredDocsOk(event: RaceEventDto): boolean {
  const keys = new Set(
    (event.documents || [])
      .filter((d) => d.fileUrl)
      .map((d) => d.documentKey)
  );
  return REQUIRED_DOC_KEYS.every((k) => keys.has(k));
}

export function buildOrganizerSetupChecklist(
  event: RaceEventDto,
  hint?: ChecklistMapHint
): SetupCheckItem[] {
  const distances = event.distances || [];
  const docs = event.documents || [];
  const bank = event.organizer?.beneficiaryAccount;
  const hasBank = Boolean(bank?.accountNumber || bank?.bankName);
  const mapOk =
    hint?.mapOk != null ? hint.mapOk : distanceHasRoute(event);
  const pricingOk = hasPricing(event);
  const docsOk = requiredDocsOk(event);
  const basicOk = Boolean(
    event.name?.trim() &&
      event.location?.trim() &&
      !/chưa cập nhật/i.test(event.location) &&
      event.date
  );
  const orgOk = Boolean(
    event.organizer?.name?.trim() &&
      event.organizer?.email?.trim() &&
      event.organizer?.phone?.trim()
  );
  const hasRegWindow = Boolean(
    event.registrationOpensAtUtc || event.registrationClosesAtUtc
  );

  return [
    {
      id: "basic",
      label: "Thông tin cơ bản",
      required: true,
      ok: basicOk,
      summary: basicOk
        ? `${event.name} · ${event.location} · ${event.date}${
            hasRegWindow ? " · có lịch ĐK" : ""
          }`
        : "Thiếu tên / địa điểm / ngày tổ chức",
    },
    {
      id: "organizer",
      label: "Ban tổ chức",
      required: true,
      ok: orgOk,
      summary: orgOk
        ? `${event.organizer.name} · ${event.organizer.email}`
        : "Thiếu tên / email / SĐT BTC",
    },
    {
      id: "bank",
      label: "Tài khoản giải ngân",
      required: false,
      ok: hasBank,
      summary: hasBank
        ? `${bank?.bankName || "—"} · ${bank?.accountNumber || "—"}`
        : "Chưa khai báo TK nhận tiền",
    },
    {
      id: "distances",
      label: "Cự ly",
      required: true,
      ok: distances.length >= 1,
      summary:
        distances.length >= 1
          ? `${distances.length} cự ly · ${distances
              .map((d) => d.name || `${d.distanceKm}K`)
              .slice(0, 4)
              .join(", ")}`
          : "Chưa có cự ly",
    },
    {
      id: "pricing",
      label: "Giá vé",
      required: true,
      ok: pricingOk,
      summary: pricingOk
        ? "Đã cấu hình giá (≥ 1 cự ly có giá > 0)"
        : "Chưa có giá vé",
    },
    {
      id: "docs",
      label: "Tài liệu bắt buộc",
      required: true,
      ok: docsOk,
      summary: docsOk
        ? `${docs.filter((d) => d.fileUrl).length}/${docs.length || REQUIRED_DOC_KEYS.length} file đã upload`
        : "Thiếu công văn / phương án an ninh (bắt buộc)",
    },
    {
      id: "map",
      label: "Bản đồ / cung đường",
      required: true,
      ok: mapOk,
      summary: mapOk
        ? hint?.mapSummary || "Có cung đường trên ít nhất 1 cự ly"
        : "Chưa thiết lập cung đường",
    },
  ];
}

export function checklistReady(items: SetupCheckItem[]): boolean {
  return items.filter((i) => i.required).every((i) => i.ok);
}
