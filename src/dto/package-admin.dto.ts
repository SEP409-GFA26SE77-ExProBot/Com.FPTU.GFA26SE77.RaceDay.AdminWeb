/** Admin package catalog + promo — khớp Event admin APIs. */

export interface PackageDurationOptionDto {
  id: string;
  name: string;
  months: number;
  price: number;
  status: "active" | "inactive" | string;
  sortOrder: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PackageCapacityOptionDto {
  id: string;
  name: string;
  maxParticipants: number;
  addOnFee: number;
  status: "active" | "inactive" | string;
  sortOrder: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PromoCodeDto {
  id: string;
  code: string;
  /** 0–1 (0.1 = 10%) */
  percentOff: number;
  status: "active" | "inactive" | string;
  expiresAtUtc?: string | null;
  maxRedemptions?: number | null;
  usedCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreatePackageDurationBody {
  name: string;
  months: number;
  price: number;
  sortOrder?: number | null;
}

export interface UpdatePackageDurationBody {
  name?: string | null;
  price?: number | null;
  sortOrder?: number | null;
  active?: boolean | null;
}

export interface CreatePackageCapacityBody {
  name: string;
  maxParticipants: number;
  addOnFee: number;
  sortOrder?: number | null;
}

export interface UpdatePackageCapacityBody {
  name?: string | null;
  addOnFee?: number | null;
  sortOrder?: number | null;
  active?: boolean | null;
}

export interface CreatePromoCodeBody {
  code: string;
  /** fraction 0–1 */
  percentOff: number;
  expiresAtUtc?: string | null;
  maxRedemptions?: number | null;
}

export interface UpdatePromoCodeBody {
  active?: boolean | null;
  expiresAtUtc?: string | null;
  clearExpiry?: boolean;
  maxRedemptions?: number | null;
  clearMaxRedemptions?: boolean;
}
