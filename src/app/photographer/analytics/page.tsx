"use client";

import { SectionHeader, Card } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#06B6D4";
const CR = "6,182,212";

export default function PhotographerAnalyticsPage() {
  const events = [
    { name: "Dalat Ultra Trail 2026", views: 14820, downloads: 3241, photos: 892 },
    { name: "HCM City Night Run", views: 8430, downloads: 1802, photos: 441 },
    { name: "Hanoi Spring 5K", views: 3210, downloads: 670, photos: 188 },
  ];
  const topPhotos = [
    { file: "IMG_1042.jpg", views: 1204, downloads: 312 },
    { file: "IMG_0881.jpg", views: 988, downloads: 244 },
    { file: "IMG_2201.jpg", views: 742, downloads: 198 },
    { file: "IMG_0993.jpg", views: 610, downloads: 155 },
  ];

  return (
    <RouteTab tab="analytics">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-PHO-05"
        title="Photo Analytics"
        desc="Track view and download counts for your photos across all events."
        color={C}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginBottom: "20px" }}>
        {events.map((ev) => (
          <Card key={ev.name}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px", marginBottom: "12px" }}>{ev.name}</div>
            {[
              { label: "👁️ Views", value: ev.views.toLocaleString("en-US"), max: 20000 },
              { label: "⬇️ Downloads", value: ev.downloads.toLocaleString("en-US"), max: 5000 },
              { label: "📷 Photos", value: ev.photos.toLocaleString("en-US"), max: 1000 },
            ].map((m) => (
              <div key={m.label} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
                  <span>{m.label}</span>
                  <span style={{ color: C, fontWeight: 700 }}>{m.value}</span>
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(parseInt(m.value.replace(/,/g, "")) / m.max) * 100}%`,
                      background: `rgba(${CR},0.7)`,
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
          🏆 Top Photos
        </div>
        {topPhotos.map((p, i) => (
          <div
            key={p.file}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 0",
              borderBottom: i < topPhotos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#1E293B", width: "24px", textAlign: "center" }}>#{i + 1}</span>
            <span style={{ flex: 1, fontSize: "13px", color: "#94A3B8" }}>{p.file}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>👁️ {p.views.toLocaleString("en-US")}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>⬇️ {p.downloads.toLocaleString("en-US")}</span>
          </div>
        ))}
      </Card>
    </div>
    </RouteTab>
  );
}
