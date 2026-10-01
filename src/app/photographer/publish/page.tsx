"use client";

import { SectionHeader, Card, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";
const CR = "6,182,212";

export default function PhotographerPublishPage() {
  const pending = [
    { count: 48, event: "Dalat Ultra Trail 2026", zone: "CP3", date: "2h ago" },
    { count: 21, event: "Dalat Ultra Trail 2026", zone: "Finish", date: "3h ago" },
    { count: 14, event: "HCM City Night Run", zone: "KM21", date: "1d ago" },
  ];

  return (
    <RouteTab tab="publish">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-06"
        title="Publish Photos"
        desc="Confirm and publish tagged photos so runners can search by BIB number. Unpublished photos are only visible to you."
        color={C}
      />
      {pending.map((batch, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              background: `rgba(${CR},0.12)`,
              border: `1px solid rgba(${CR},0.22)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 800, color: C }}>{batch.count}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px", marginBottom: "2px" }}>
              {batch.event} — {batch.zone}
            </div>
            <div style={{ fontSize: "12px", color: "#475569" }}>
              {batch.count} photos ready · uploaded {batch.date}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn label="Preview" />
            <Btn label="Publish All" primary color={C} colorRgb={CR} />
          </div>
        </Card>
      ))}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button
          style={{
            padding: "10px 28px",
            borderRadius: "10px",
            background: `rgba(${CR},0.18)`,
            border: `1px solid rgba(${CR},0.3)`,
            color: C,
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🚀 Publish All Pending (83 photos)
        </button>
      </div>
    </div>
    </RouteTab>
  );
}
