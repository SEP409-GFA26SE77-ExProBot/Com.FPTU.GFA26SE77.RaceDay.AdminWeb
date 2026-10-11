/**
 * Admin escrow / payout / fee settings.
 * MOCK mặc định: NEXT_PUBLIC_FINANCE_USE_MOCK !== "false"
 */
import api from "@/config/axios";
import type {
  AdminPayoutRequestDto,
  PlatformFeeSettingsDto,
  PlatformFinanceOverviewDto,
} from "@/dto/finance.dto";

const FINANCE_API = "api/v1/finance/admin";

export const FINANCE_USE_MOCK =
  process.env.NEXT_PUBLIC_FINANCE_USE_MOCK !== "false";

const LS_PAYOUTS = "raceday.admin.payouts.v1";
const LS_SETTINGS = "raceday.admin.fee-settings.v1";

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
    note: "Giải ngân đợt khả dụng",
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

const DEFAULT_SETTINGS: PlatformFeeSettingsDto = {
  platformFeePercent: 5,
  preEventWithdrawPercent: 50,
  postEventWithdrawPercent: 50,
  minPayoutAmount: 500_000,
  notes: "Rút tối đa 50% trước race day, 50% còn lại sau khi giải kết thúc.",
};

export async function listAdminPayoutRequests(): Promise<AdminPayoutRequestDto[]> {
  if (FINANCE_USE_MOCK) {
    return readJson(LS_PAYOUTS, SEED_PAYOUTS);
  }
  return api.get(`${FINANCE_API}/payouts`);
}

export async function approveAdminPayout(
  id: string,
  receiptUrl?: string
): Promise<AdminPayoutRequestDto> {
  if (FINANCE_USE_MOCK) {
    const list = readJson(LS_PAYOUTS, SEED_PAYOUTS);
    const next = list.map((p) =>
      p.id === id
        ? {
            ...p,
            status: "transferred" as const,
            receiptUrl: receiptUrl || p.receiptUrl || "#",
          }
        : p
    );
    writeJson(LS_PAYOUTS, next);
    const row = next.find((p) => p.id === id);
    if (!row) throw new Error("Không tìm thấy yêu cầu.");
    return row;
  }
  return api.post(`${FINANCE_API}/payouts/${id}/approve`, { receiptUrl });
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
  return api.post(`${FINANCE_API}/payouts/${id}/reject`, { reason });
}

export async function getPlatformFinanceOverview(): Promise<PlatformFinanceOverviewDto> {
  if (FINANCE_USE_MOCK) {
    return {
      totalEscrowHeld: 186_400_000,
      platformFeeCollected: 24_850_000,
      pendingPayoutAmount: 12_200_000,
      transferredThisMonth: 45_000_000,
      currency: "VND",
    };
  }
  return api.get(`${FINANCE_API}/overview`);
}

export async function getPlatformFeeSettings(): Promise<PlatformFeeSettingsDto> {
  if (FINANCE_USE_MOCK) {
    return readJson(LS_SETTINGS, DEFAULT_SETTINGS);
  }
  return api.get(`${FINANCE_API}/settings`);
}

export async function savePlatformFeeSettings(
  body: PlatformFeeSettingsDto
): Promise<PlatformFeeSettingsDto> {
  if (FINANCE_USE_MOCK) {
    writeJson(LS_SETTINGS, body);
    return body;
  }
  return api.put(`${FINANCE_API}/settings`, body);
}
