import type { ReactNode } from "react";
import { requireServerUser } from "@/lib/require-server-user";
import RoleWorkspace from "@/components/RoleWorkspace";

export default async function RoleLayout({ children }: { children: ReactNode }) {
  await requireServerUser(["RACE_STAFF"]);
  return <RoleWorkspace role="RACE_STAFF">{children}</RoleWorkspace>;
}
