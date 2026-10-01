"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";

export default function PhotographerRequestsPage() {
  const reqs = [
    { id: "REQ-001", photo: "IMG_3821.jpg", type: "Remove", runner: "BIB #A0042", reason: "Privacy concern", status: "pending" },
    { id: "REQ-002", photo: "IMG_3822.jpg", type: "Edit", runner: "BIB #B0117", reason: "Wrong BIB tagged", status: "resolved" },
    { id: "REQ-003", photo: "IMG_3823.jpg", type: "Hide", runner: "BIB #A0289", reason: "Unflattering image", status: "pending" },
    { id: "REQ-004", photo: "IMG_3824.jpg", type: "Remove", runner: "BIB #C0055", reason: "Duplicate photo", status: "pending" },
    { id: "REQ-005", photo: "IMG_3825.jpg", type: "Edit", runner: "BIB #A0110", reason: "BIB correction", status: "resolved" },
  ];

  const typeColor = (t: string) => (t === "Remove" ? "rose" : t === "Hide" ? "amber" : "cyan");

  return (
    <RouteTab tab="requests">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-07"
        title="Edit / Hide / Remove Requests"
        desc="Process photo modification requests from runners, subject to the Organizer's content policy."
        color={C}
      />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ID", "Photo", "Type", "Runner", "Reason", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>{r.id}</td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.photo}</td>
                <td style={{ padding: "10px" }}>
                  <Badge label={r.type} type={typeColor(r.type) as "rose" | "amber" | "cyan"} />
                </td>
                <td style={{ padding: "10px", fontSize: "13px", color: C, fontWeight: 600 }}>{r.runner}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#475569", maxWidth: "160px" }}>{r.reason}</td>
                <td style={{ padding: "10px" }}>
                  <Badge label={r.status} type={r.status === "resolved" ? "green" : "gray"} />
                </td>
                <td style={{ padding: "10px", display: "flex", gap: "6px" }}>
                  {r.status === "pending" && (
                    <>
                      <Btn label="Approve" primary color={C} />
                      <Btn label="Reject" />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
    </RouteTab>
  );
}
