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

export type SystemErrorRefundStatus =
  | "requested"
  | "processing"
  | "refunded"
  | "rejected";

export interface ManagerSystemErrorRefundDto {
  id: string;
  paymentId: string;
  registrationId: string;
  eventId: string;
  userId: string;
  paidAmount: number;
  refundAmount: number;
  refundPercent: number;
  reason: string;
  status: SystemErrorRefundStatus | string;
  createdAt: string;
  updatedAt?: string;
  rejectReason?: string;
  eventName?: string | null;
  registrationStatus?: string | null;
  runnerName?: string | null;
  runnerEmail?: string | null;
  bibNumber?: string | null;
  reasonText?: string | null;
  evidenceUrls?: string[] | null;
}
