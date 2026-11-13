import { redirect } from "next/navigation";

/** Hoàn lỗi HT Admin đã gỡ — dùng workspace Manager /refund-claims. */
export default function AdministratorRefundClaimsRedirectPage() {
  redirect("/users");
}
