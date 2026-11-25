"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#10B981";
const CR = "16,185,129";

export default function RaceStaffIssuesPage() {
  const issues = [
    { id: "ISS-001", type: "Mất mã QR", bib: "A0042", runner: "Nguyen Van A", status: "open", opened: "08:32" },
    { id: "ISS-002", type: "Cấp lại BIB", bib: "C0055", runner: "Le Van C", status: "resolved", opened: "07:15" },
  ];

  return (
    <RouteTab tab="issues">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-VOL-03"
        title="Xử lý sự cố tại chỗ"
        desc="Xử lý các sự cố tại chỗ như mất mã QR hoặc cấp lại số BIB cho VĐV."
        color={C}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "14px",
            }}
          >
            🆕 Ghi nhận sự cố mới
          </div>
          {[
            { label: "BIB của VĐV", placeholder: "VD: A0042" },
            { label: "Tên VĐV", placeholder: "VD: Nguyen Van A" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  display: "block",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {f.label}
              </label>
              <input
                className="runner-status-field"
                placeholder={f.placeholder}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "var(--input)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>
          ))}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Loại sự cố
            </label>
            <select
              className="runner-status-field"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "var(--input)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <option style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}>Mất mã QR</option>
              <option style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}>Cần cấp lại BIB</option>
              <option style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}>Hỗ trợ y tế</option>
              <option style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}>Khác</option>
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Ghi chú
            </label>
            <textarea
              className="runner-status-field"
              placeholder="Mô tả sự cố…"
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "var(--input)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "13px",
                resize: "vertical",
              }}
            />
          </div>
          <button
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "9px",
              background: `rgba(${CR},0.18)`,
              border: `1px solid rgba(${CR},0.3)`,
              color: C,
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Ghi nhận sự cố
          </button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {issues.map((iss) => (
            <Card key={iss.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#334155",
                      fontFamily: "monospace",
                    }}
                  >
                    {iss.id}
                  </span>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-primary, #0f172a)",
                      marginTop: "2px",
                    }}
                  >
                    {iss.type}
                  </div>
                </div>
                <Badge label={iss.status === "open" ? "Đang mở" : "Đã xử lý"} type={iss.status === "open" ? "amber" : "green"} />
              </div>
              <div style={{ fontSize: "13px", color: "#475569", marginBottom: "12px" }}>
                VĐV: <span style={{ color: C, fontWeight: 600 }}>{iss.bib}</span> · {iss.runner}
                <br />
                <span style={{ fontSize: "11px", color: "#334155" }}>Mở lúc {iss.opened}</span>
              </div>
              {iss.status === "open" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn label="Cấp lại BIB" primary color={C} colorRgb={CR} />
                  <Btn label="Đánh dấu đã xử lý" color={C} colorRgb={CR} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
    </RouteTab>
  );
}
