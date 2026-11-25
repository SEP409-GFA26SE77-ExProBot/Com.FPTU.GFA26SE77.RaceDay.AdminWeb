import { redirect } from "next/navigation";

/** Cấu hình phí / finance Admin đã gỡ — bookmark cũ → Người dùng. */
export default function AdministratorSettingsRedirectPage() {
  redirect("/users");
}
