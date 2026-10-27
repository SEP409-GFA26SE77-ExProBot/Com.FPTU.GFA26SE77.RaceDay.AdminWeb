import type { ReactNode } from "react";
import { requireServerUser } from "@/lib/require-server-user";
import RoleWorkspace from "@/components/RoleWorkspace";

export default async function RoleLayout({ children }: { children: ReactNode }) {
  await requireServerUser(["ADMIN"]);
  return <RoleWorkspace role="ADMIN">{children}</RoleWorkspace>;
}
