import { redirect } from "next/navigation";

/** Medical was renamed to Emergency; keep old bookmarks working. */
export default function RaceStaffMedicalRedirectPage() {
  redirect("/emergency");
}
