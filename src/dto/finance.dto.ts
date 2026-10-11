export type AdminPayoutStatus =
  | "pending"
  | "approved"
  | "transferred"
  | "rejected";

export interface AdminBankAccountDto {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface AdminPayoutRequestDto {
  id: string;
  organizerId: string;
  organizerName: string;
  eventId?: string;
  eventName?: string;
  amount: number;
  note?: string;
  status: AdminPayoutStatus;
  rejectReason?: string;
  bankAccount: AdminBankAccountDto;
  createdAt: string;
  receiptUrl?: string;
}

export interface PlatformFinanceOverviewDto {
  totalEscrowHeld: number;
  platformFeeCollected: number;
  pendingPayoutAmount: number;
  transferredThisMonth: number;
  currency: string;
}

export interface PlatformFeeSettingsDto {
  platformFeePercent: number;
  preEventWithdrawPercent: number;
  postEventWithdrawPercent: number;
  minPayoutAmount: number;
  notes?: string;
}
