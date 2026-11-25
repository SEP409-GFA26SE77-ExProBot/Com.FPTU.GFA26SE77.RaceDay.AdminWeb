"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#8B5CF6";
const CR = "139,92,246";

export default function ManagerReconciliationPage() {
  const anomalies = [
    { id: "ANO-001", type: "Thiếu checkpoint", bib: "A0042", detail: "Không có lượt quét tại CP2 (KM21) — nhảy từ CP1 sang CP3", severity: "rose" as const, status: "open" },
    { id: "ANO-002", type: "Thời gian không hợp lệ", bib: "B0117", detail: "Giờ CP3 (08:12) sớm hơn giờ CP2 (08:45)", severity: "rose" as const, status: "open" },
    { id: "ANO-003", type: "Quét BIB trùng", bib: "C0055", detail: "BIB được quét hai lần tại CP1 trong vòng 0,8 giây", severity: "amber" as const, status: "open" },
    { id: "ANO-004", type: "Thiếu checkpoint", bib: "A0289", detail: "Không có lượt quét tại CP1 — đã đối soát bằng nhập tay", severity: "amber" as const, status: "resolved" },
    { id: "ANO-005", type: "Thời gian không hợp lệ", bib: "D0031", detail: "Giờ về đích sớm hơn giờ CP4 3 phút", severity: "rose" as const, status: "open" },
    { id: "ANO-006", type: "Quét BIB trùng", bib: "B0204", detail: "Cùng một BIB được quét đồng thời tại hai CP khác nhau", severity: "rose" as const, status: "open" },
    { id: "ANO-007", type: "Thiếu checkpoint", bib: "C0091", detail: "Không có lượt quét tại vạch đích — VĐV báo đã về đích", severity: "amber" as const, status: "review" },
    { id: "ANO-008", type: "Thời gian không hợp lệ", bib: "A0195", detail: "Giờ CP2 sớm hơn giờ xuất phát của giải 4 phút", severity: "rose" as const, status: "open" },
  ];
  const typeIcon = (t: string) => ({ "Thiếu checkpoint": "📍", "Thời gian không hợp lệ": "⏱️", "Quét BIB trùng": "🔁" }[t] ?? "⚠️");

  return (
    <RouteTab tab="reconciliation">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-ADM-03"
        title="Đối soát dữ liệu thời gian"
        desc="Hệ thống tự động phát hiện bất thường: thiếu checkpoint, thời gian không hợp lệ và quét BIB trùng. Hãy xem xét và xử lý từng trường hợp."
        color={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Thiếu checkpoint", count: 3, color: "#8B5CF6", icon: "📍" },
          { label: "Thời gian không hợp lệ", count: 3, color: "#EF4444", icon: "⏱️" },
          { label: "Quét trùng", count: 2, color: "#F59E0B", icon: "🔁" },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ID", "Loại", "BIB", "Chi tiết", "Mức độ", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{a.id}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span style={{ marginRight: "4px" }}>{typeIcon(a.type)}</span>
                  {a.type}
                </td>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 700, color: C, fontFamily: "monospace" }}>{a.bib}</td>
                <td style={{ padding: "10px", fontSize: "11px", color: "var(--text-secondary)", maxWidth: "200px", lineHeight: 1.4 }}>{a.detail}</td>
                <td style={{ padding: "10px" }}><Badge label={a.severity === "rose" ? "CAO" : "TRUNG BÌNH"} type={a.severity} /></td>
                <td style={{ padding: "10px" }}><Badge label={a.status} type={a.status === "resolved" ? "green" : a.status === "review" ? "violet" : "amber"} /></td>
                <td style={{ padding: "10px" }}>
                  {a.status !== "resolved" && (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Btn label="Xử lý" primary small color={C} colorRgb={CR} />
                      <Btn label="Ghi đè" small color={C} colorRgb={CR} />
                    </div>
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
