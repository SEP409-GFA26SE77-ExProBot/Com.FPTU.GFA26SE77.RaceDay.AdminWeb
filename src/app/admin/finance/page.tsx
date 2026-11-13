import { redirect } from "next/navigation";

/** Tài chính Admin đã gỡ — ops ở Manager (/payouts, /refund-claims). */
export default function AdministratorFinanceRedirectPage() {
  redirect("/users");
}
