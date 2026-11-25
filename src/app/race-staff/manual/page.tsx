import { redirect } from "next/navigation";

/** Manual entry was merged into the scanner page; keep old bookmarks working. */
export default function RaceStaffManualRedirectPage() {
  redirect("/scanner");
}
