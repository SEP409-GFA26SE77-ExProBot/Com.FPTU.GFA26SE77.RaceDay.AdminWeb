import { requireServerUser } from "@/lib/require-server-user";
import ChangePasswordShell from "@/components/ChangePasswordShell";
import { mapAppRole } from "@/lib/role";

export default async function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireServerUser();
  const role = mapAppRole(user.roleName);

  return <ChangePasswordShell role={role}>{children}</ChangePasswordShell>;
}
