"use client";

import { SectionHeader, Card, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";

export default function PhotographerOcrPage() {
  const tagged = [
    { photo: "IMG_4801.jpg", bib: "A0042", runner: "Nguyen Van A", conf: 98.2, zone: "CP3" },
    { photo: "IMG_4802.jpg", bib: "B0117", runner: "Tran Thi B", conf: 94.7, zone: "KM10" },
    { photo: "IMG_4803.jpg", bib: "A0289", runner: "Le Van C", conf: 99.1, zone: "Start" },
    { photo: "IMG_4804.jpg", bib: "C0055", runner: "Pham Thi D", conf: 87.3, zone: "CP1" },
    { photo: "IMG_4805.jpg", bib: "A0110", runner: "Hoang Van E", conf: 91.5, zone: "Finish" },
  ];

  return (
    <RouteTab tab="ocr">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-03"
        title="OCR BIB Recognition"
        desc="Photos are automatically scanned for BIB numbers using AI OCR. Review confidence scores and tag accuracy."
        color={C}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Processed Today", value: "2,341", icon: "🔍" },
          { label: "Auto-Tagged", value: "2,261", icon: "✅" },
          { label: "Avg Confidence", value: "97.3%", icon: "🎯" },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: C, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
          Recently Tagged
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Photo", "BIB", "Runner", "Confidence", "Zone", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tagged.map((r) => (
              <tr key={r.photo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.photo}</td>
                <td style={{ padding: "10px", fontSize: "13px", fontWeight: 700, color: C }}>{r.bib}</td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.runner}</td>
                <td style={{ padding: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "60px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${r.conf}%`,
                          background: r.conf >= 95 ? "#10B981" : r.conf >= 88 ? "#F59E0B" : "#EF4444",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>{r.conf}%</span>
                  </div>
                </td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#64748B" }}>{r.zone}</td>
                <td style={{ padding: "10px" }}><Btn label="Verify" primary color={C} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
    </RouteTab>
  );
}
