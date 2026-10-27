/**
 * Admin: gói thời hạn / quy mô VĐV / mã giảm giá.
 * GET/POST/PATCH /api/v1/event/admin/...
 */
import api from "@/config/axios";
import type {
  CreatePackageCapacityBody,
  CreatePackageDurationBody,
  CreatePromoCodeBody,
  PackageCapacityOptionDto,
  PackageDurationOptionDto,
  PromoCodeDto,
  UpdatePackageCapacityBody,
  UpdatePackageDurationBody,
  UpdatePromoCodeBody,
} from "@/dto/package-admin.dto";

const DURATIONS = "api/v1/event/admin/package-durations";
const CAPACITIES = "api/v1/event/admin/package-capacities";
const PROMOS = "api/v1/event/admin/promos";

export async function listPackageDurations(): Promise<PackageDurationOptionDto[]> {
  return api.get(DURATIONS);
}

export async function createPackageDuration(
  body: CreatePackageDurationBody
): Promise<PackageDurationOptionDto> {
  return api.post(DURATIONS, body);
}

export async function updatePackageDuration(
  id: string,
  body: UpdatePackageDurationBody
): Promise<PackageDurationOptionDto> {
  return api.patch(`${DURATIONS}/${id}`, body);
}

export async function listPackageCapacities(): Promise<PackageCapacityOptionDto[]> {
  return api.get(CAPACITIES);
}

export async function createPackageCapacity(
  body: CreatePackageCapacityBody
): Promise<PackageCapacityOptionDto> {
  return api.post(CAPACITIES, body);
}

export async function updatePackageCapacity(
  id: string,
  body: UpdatePackageCapacityBody
): Promise<PackageCapacityOptionDto> {
  return api.patch(`${CAPACITIES}/${id}`, body);
}

export async function listPromoCodes(): Promise<PromoCodeDto[]> {
  return api.get(PROMOS);
}

export async function createPromoCode(
  body: CreatePromoCodeBody
): Promise<PromoCodeDto> {
  return api.post(PROMOS, body);
}

export async function updatePromoCode(
  id: string,
  body: UpdatePromoCodeBody
): Promise<PromoCodeDto> {
  return api.patch(`${PROMOS}/${id}`, body);
}
