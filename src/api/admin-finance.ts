/**
 * Manager duyệt giải ngân + hoàn lỗi HT.
 * Mặc định gọi BE thật. Bật mock chỉ khi NEXT_PUBLIC_FINANCE_USE_MOCK=true
 */
import api from "@/config/axios";
import type {
  AdminPayoutRequestDto,
  ManagerSystemErrorRefundDto,
} from "@/dto/finance.dto";

const MANAGER_FINANCE_API = "api/v1/finance/manager";

export const FINANCE_USE_MOCK =
  process.env.NEXT_PUBLIC_FINANCE_USE_MOCK === "true";

const LS_PAYOUTS = "raceday.admin.payouts.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const SEED_PAYOUTS: AdminPayoutRequestDto[] = [
  {
    id: "apo-1",
    organizerId: "org-1",
    organizerName: "BTC Mỹ Khê Run",
    eventId: "ev-1",
    eventName: "Fun Run 5K Mỹ Khê 2027 (demo)",
    amount: 12_200_000,
    note: "Giải ngân đợt tạm ứng T-4 tuần",
    status: "pending",
    bankAccount: {
      bankName: "Vietcombank",
      accountNumber: "0123456789",
      accountHolderName: "NGUYEN VAN ORGANIZER",
    },
    createdAt: "2026-10-08T04:00:00.000Z",
  },
  {
    id: "apo-2",
    organizerId: "org-2",
    organizerName: "Da Nang Trail Club",
    eventId: "ev-2",
    eventName: "Son Tra Trail 21K",
    amount: 8_000_000,
    status: "transferred",
    bankAccount: {
      bankName: "Techcombank",
      accountNumber: "9988776655",
      accountHolderName: "TRAN THI BTC",
    },
    createdAt: "2026-09-15T02:00:00.000Z",
    receiptUrl: "#",
  },
];

export async function listAdminPayoutRequests(): Promise<AdminPayoutRequestDto[]> {
  if (FINANCE_USE_MOCK) {
    return readJson(LS_PAYOUTS, SEED_PAYOUTS);
  }
  return api.get(`${MANAGER_FINANCE_API}/payouts`);
}

export async function approveAdminPayout(
  id: string
): Promise<AdminPayoutRequestDto> {
  if (FINANCE_USE_MOCK) {
    const list = readJson(LS_PAYOUTS, SEED_PAYOUTS);
    const next = list.map((p) =>
      p.id === id ? { ...p, status: "approved" as const } : p
    );
    writeJson(LS_PAYOUTS, next);
    const row = next.find((p) => p.id === id);
    if (!row) throw new Error("Không tìm thấy yêu cầu.");
    return row;
  }
  return api.post(`${MANAGER_FINANCE_API}/payouts/${id}/approve`, {});
}

export async function confirmTransferAdminPayout(
  id: string,
  receiptUrl: string
): Promise<AdminPayoutRequestDto> {
  if (FINANCE_USE_MOCK) {
    if (!receiptUrl.trim()) {
      throw new Error("Cần URL biên nhận / chứng từ chuyển khoản.");
    }
    const list = readJson(LS_PAYOUTS, SEED_PAYOUTS);
    const next = list.map((p) =>
      p.id === id
        ? {
            ...p,
            status: "transferred" as const,
            receiptUrl: receiptUrl.trim(),
          }
        : p
    );
    writeJson(LS_PAYOUTS, next);
    const row = next.find((p) => p.id === id);
    if (!row) throw new Error("Không tìm thấy yêu cầu.");
    return row;
  }
  return api.post(`${MANAGER_FINANCE_API}/payouts/${id}/confirm-transfer`, {
    receiptUrl,
  });
}

export async function rejectAdminPayout(
  id: string,
  reason: string
): Promise<AdminPayoutRequestDto> {
  if (FINANCE_USE_MOCK) {
    const list = readJson(LS_PAYOUTS, SEED_PAYOUTS);
    const next = list.map((p) =>
      p.id === id
        ? { ...p, status: "rejected" as const, rejectReason: reason }
        : p
    );
    writeJson(LS_PAYOUTS, next);
    const row = next.find((p) => p.id === id);
    if (!row) throw new Error("Không tìm thấy yêu cầu.");
    return row;
  }
  return api.post(`${MANAGER_FINANCE_API}/payouts/${id}/reject`, { reason });
}

export async function listSystemErrorRefunds(
  pendingOnly = true
): Promise<ManagerSystemErrorRefundDto[]> {
  if (FINANCE_USE_MOCK) {
    return [];
  }
  const q = pendingOnly ? "?pendingOnly=true" : "?pendingOnly=false";
  return api.get(`${MANAGER_FINANCE_API}/system-error-refunds${q}`);
}

export async function approveSystemErrorRefund(
  id: string
): Promise<ManagerSystemErrorRefundDto> {
  if (FINANCE_USE_MOCK) {
    throw new Error("Mock không hỗ trợ duyệt khiếu nại lỗi hệ thống.");
  }
  return api.post(`${MANAGER_FINANCE_API}/system-error-refunds/${id}/approve`, {});
}

export async function rejectSystemErrorRefund(
  id: string,
  reason: string
): Promise<ManagerSystemErrorRefundDto> {
  if (FINANCE_USE_MOCK) {
    throw new Error("Mock không hỗ trợ từ chối khiếu nại lỗi hệ thống.");
  }
  return api.post(`${MANAGER_FINANCE_API}/system-error-refunds/${id}/reject`, {
    reason,
  });
}
