import { redirect } from "next/navigation";

/** Giải ngân thuộc Manager — bookmark cũ /admin/payouts chuyển sang /payouts (Manager). */
export default function AdminPayoutsRedirectPage() {
  redirect("/payouts");
}
