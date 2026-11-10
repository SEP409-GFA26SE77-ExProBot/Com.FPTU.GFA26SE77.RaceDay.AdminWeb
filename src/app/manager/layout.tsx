import type { ReactNode } from "react";
import { requireServerUser } from "@/lib/require-server-user";
import RoleWorkspace from "@/components/RoleWorkspace";

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  await requireServerUser(["MANAGER"]);
  return <RoleWorkspace role="MANAGER">{children}</RoleWorkspace>;
}
