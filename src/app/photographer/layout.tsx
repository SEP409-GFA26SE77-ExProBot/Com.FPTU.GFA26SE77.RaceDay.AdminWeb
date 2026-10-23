import type { ReactNode } from "react";
import { requireServerUser } from "@/lib/require-server-user";
import RoleWorkspace from "@/components/RoleWorkspace";
import { PhotoWorkspaceProvider } from "@/components/photographer/PhotoWorkspace";

export default async function RoleLayout({ children }: { children: ReactNode }) {
  await requireServerUser(["PHOTOGRAPHER"]);
  return <RoleWorkspace role="PHOTOGRAPHER"><PhotoWorkspaceProvider>{children}</PhotoWorkspaceProvider></RoleWorkspace>;
}
