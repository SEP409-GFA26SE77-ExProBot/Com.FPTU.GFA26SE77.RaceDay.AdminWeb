"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";

export default function PhotographerCorrectionsPage() {
  const items = [
    { photo: "IMG_4711.jpg", ocr: "A0O42", correct: "A0042", status: "pending" as const },
    { photo: "IMG_4712.jpg", ocr: "B0l17", correct: "B0117", status: "corrected" as const },
    { photo: "IMG_4713.jpg", ocr: "C0O55", correct: "C0055", status: "pending" as const },
    { photo: "IMG_4714.jpg", ocr: "A02B9", correct: "A0289", status: "corrected" as const },
    { photo: "IMG_4715.jpg", ocr: "B0l92", correct: "", status: "pending" as const },
  ];

  return (
    <RouteTab tab="corrections">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-04"
        title="BIB Corrections"
        desc="Review photos where OCR detection was uncertain or incorrect. Enter the correct BIB number manually."
        color={C}
      />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Photo", "OCR Result", "Correct BIB", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.photo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.photo}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                    {r.ocr}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  {r.status === "corrected" ? (
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#10B981" }}>{r.correct}</span>
                  ) : (
                    <input
                      defaultValue={r.correct}
                      placeholder="Enter BIB…"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        width: "100px",
                      }}
                    />
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  <Badge label={r.status} type={r.status === "corrected" ? "green" : "amber"} />
                </td>
                <td style={{ padding: "10px", display: "flex", gap: "6px" }}>
                  {r.status === "pending" && <Btn label="Save" primary color={C} />}
                  <Btn label="View Photo" />
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
