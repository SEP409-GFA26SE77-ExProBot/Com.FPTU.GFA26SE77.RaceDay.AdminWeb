import { cookies } from "next/headers";
import ChangePasswordShell from "@/components/ChangePasswordShell";
import { mapAppRole } from "@/lib/role";

export default async function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = mapAppRole(cookieStore.get("role")?.value);

  return <ChangePasswordShell role={role}>{children}</ChangePasswordShell>;
}
