"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";
const CR = "6,182,212";

export default function PhotographerUploadPage() {
  const recent = [
    { name: "IMG_4821.jpg", size: "3.2 MB", status: "tagged" as const, bibs: 4 },
    { name: "IMG_4822.jpg", size: "2.9 MB", status: "processing" as const, bibs: 0 },
    { name: "IMG_4823.jpg", size: "4.1 MB", status: "tagged" as const, bibs: 2 },
    { name: "IMG_4824.jpg", size: "1.8 MB", status: "error" as const, bibs: 0 },
    { name: "IMG_4825.jpg", size: "3.6 MB", status: "tagged" as const, bibs: 6 },
  ];

  return (
    <RouteTab tab="upload">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-02"
        title="Bulk Photo Upload"
        desc="Drag and drop photos for the selected event. Photos are queued for OCR BIB detection automatically."
        color={C}
      />
      {/* Drop zone */}
      <div
        style={{
          border: `2px dashed rgba(${CR},0.35)`,
          borderRadius: "16px",
          padding: "48px 24px",
          textAlign: "center",
          background: `rgba(${CR},0.04)`,
          marginBottom: "20px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>☁️</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
          Drop photos here or click to browse
        </div>
        <div style={{ fontSize: "12px", color: "#475569" }}>
          Supports JPG, PNG, RAW · Max 25 MB per file · Up to 500 files at once
        </div>
        <button
          style={{
            marginTop: "16px",
            padding: "9px 20px",
            borderRadius: "8px",
            background: `rgba(${CR},0.18)`,
            border: `1px solid rgba(${CR},0.3)`,
            color: C,
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Select Files
        </button>
      </div>

      {/* Recent uploads */}
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
          Recent Uploads
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["File", "Size", "BIBs Found", "Status", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    fontSize: "11px",
                    color: "#334155",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.name}</td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#475569" }}>{r.size}</td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#fff", fontWeight: 600 }}>{r.bibs}</td>
                <td style={{ padding: "10px" }}>
                  <Badge
                    label={r.status}
                    type={r.status === "tagged" ? "green" : r.status === "processing" ? "amber" : "rose"}
                  />
                </td>
                <td style={{ padding: "10px" }}>
                  <Btn label="View" color={C} colorRgb={CR} />
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
