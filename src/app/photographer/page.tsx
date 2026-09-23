"use client";

import DashboardShell, { NavItem, StatItem } from "@/components/DashboardShell";

/* ── helpers ──────────────────────────────────────────────────────── */
const C = "#06B6D4"; // cyan accent
const CR = "6,182,212";

function SectionHeader({ id, title, desc }: { id: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontSize: "10px", color: C, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
        {id}
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{title}</h2>
      <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px",
      padding: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Badge({ label, type }: { label: string; type: "green" | "amber" | "rose" | "cyan" | "gray" | "violet" }) {
  const map = { green: "badge-green", amber: "badge-amber", rose: "badge-rose", cyan: "badge-cyan", gray: "badge-gray", violet: "badge-violet" };
  return (
    <span className={map[type]} style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", display: "inline-block" }}>
      {label}
    </span>
  );
}

function Btn({ label, primary, onClick }: { label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        border: primary ? "none" : `1px solid rgba(${CR},0.3)`,
        background: primary ? `rgba(${CR},0.18)` : "transparent",
        color: primary ? C : "#64748B",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

/* ── nav & stats ─────────────────────────────────────────────────── */
const navItems: NavItem[] = [
  { id: "assignments", label: "Event Assignments",   icon: "📅", badge: 3 },
  { id: "upload",      label: "Photo Upload",        icon: "📤" },
  { id: "ocr",         label: "OCR Recognition",     icon: "🔍", badge: 12 },
  { id: "corrections", label: "BIB Corrections",     icon: "✏️", badge: 5  },
  { id: "analytics",   label: "Photo Analytics",     icon: "📊" },
  { id: "publish",     label: "Publish Photos",      icon: "🚀", badge: 48 },
  { id: "requests",    label: "Edit / Hide Requests",icon: "📬", badge: 7  },
];

const stats: StatItem[] = [
  { label: "Photos Today",   value: "2,341", change: "18%", positive: true,  icon: "📷" },
  { label: "Published",      value: "1,897", change: "11%", positive: true,  icon: "✅" },
  { label: "Pending OCR",    value: "444",   change: "3%",  positive: false, icon: "🔍" },
  { label: "Open Requests",  value: "7",                                      icon: "📬" },
  { label: "Avg Accuracy",   value: "97.3%", change: "0.4%",positive: true,  icon: "🎯" },
];

/* ── section renders ──────────────────────────────────────────────── */
function Assignments() {
  const events = [
    { name: "Dalat Ultra Trail 2026", date: "Sep 28, 2026", zone: "KM 0 – 15 (Start)", status: "active",    distance: "100km" },
    { name: "HCM City Night Run",     date: "Oct 12, 2026", zone: "Finish Line Gate",   status: "upcoming", distance: "42km"  },
    { name: "Hanoi Spring 5K",        date: "Nov 03, 2026", zone: "CP3 – Hoan Kiem",   status: "upcoming", distance: "5km"   },
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-01" title="Event Assignments" desc="Events assigned to you by the Organizer. View shooting zones, checkpoints, and race details." />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {events.map((ev) => (
          <Card key={ev.name} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🏔️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "2px" }}>{ev.name}</div>
              <div style={{ fontSize: "12px", color: "#475569" }}>{ev.date} &nbsp;·&nbsp; {ev.distance} &nbsp;·&nbsp; Zone: <span style={{ color: C }}>{ev.zone}</span></div>
            </div>
            <Badge label={ev.status} type={ev.status === "active" ? "green" : "cyan"} />
            <Btn label="View Details" primary />
          </Card>
        ))}
      </div>
    </>
  );
}

function Upload() {
  const recent = [
    { name: "IMG_4821.jpg", size: "3.2 MB", status: "tagged",    bibs: 4 },
    { name: "IMG_4822.jpg", size: "2.9 MB", status: "processing",bibs: 0 },
    { name: "IMG_4823.jpg", size: "4.1 MB", status: "tagged",    bibs: 2 },
    { name: "IMG_4824.jpg", size: "1.8 MB", status: "error",     bibs: 0 },
    { name: "IMG_4825.jpg", size: "3.6 MB", status: "tagged",    bibs: 6 },
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-02" title="Bulk Photo Upload" desc="Drag and drop photos for the selected event. Photos are queued for OCR BIB detection automatically." />
      {/* Drop zone */}
      <div style={{
        border: `2px dashed rgba(${CR},0.35)`,
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        background: `rgba(${CR},0.04)`,
        marginBottom: "20px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>☁️</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Drop photos here or click to browse</div>
        <div style={{ fontSize: "12px", color: "#475569" }}>Supports JPG, PNG, RAW · Max 25 MB per file · Up to 500 files at once</div>
        <button style={{ marginTop: "16px", padding: "9px 20px", borderRadius: "8px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
          Select Files
        </button>
      </div>
      {/* Recent uploads */}
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Recent Uploads</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["File", "Size", "BIBs Found", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
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
                  <Badge label={r.status} type={r.status === "tagged" ? "green" : r.status === "processing" ? "amber" : "rose"} />
                </td>
                <td style={{ padding: "10px" }}><Btn label="View" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function OCR() {
  const tagged = [
    { photo: "IMG_4801.jpg", bib: "A0042", runner: "Nguyen Van A", conf: 98.2, zone: "CP3" },
    { photo: "IMG_4802.jpg", bib: "B0117", runner: "Tran Thi B",   conf: 94.7, zone: "KM10" },
    { photo: "IMG_4803.jpg", bib: "A0289", runner: "Le Van C",     conf: 99.1, zone: "Start" },
    { photo: "IMG_4804.jpg", bib: "C0055", runner: "Pham Thi D",   conf: 87.3, zone: "CP1"  },
    { photo: "IMG_4805.jpg", bib: "A0110", runner: "Hoang Van E",  conf: 91.5, zone: "Finish"},
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-03" title="OCR BIB Recognition" desc="Photos are automatically scanned for BIB numbers using AI OCR. Review confidence scores and tag accuracy." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Processed Today",  value: "2,341", icon: "🔍" },
          { label: "Auto-Tagged",      value: "2,261", icon: "✅" },
          { label: "Avg Confidence",   value: "97.3%", icon: "🎯" },
        ].map((s) => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: C, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Recently Tagged</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Photo", "BIB", "Runner", "Confidence", "Zone", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
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
                      <div style={{ height: "100%", width: `${r.conf}%`, background: r.conf >= 95 ? "#10B981" : r.conf >= 88 ? "#F59E0B" : "#EF4444", borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>{r.conf}%</span>
                  </div>
                </td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#64748B" }}>{r.zone}</td>
                <td style={{ padding: "10px" }}><Btn label="Verify" primary /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Corrections() {
  const items = [
    { photo: "IMG_4711.jpg", ocr: "A0O42", correct: "A0042", status: "pending" },
    { photo: "IMG_4712.jpg", ocr: "B0l17", correct: "B0117", status: "corrected" },
    { photo: "IMG_4713.jpg", ocr: "C0O55", correct: "C0055", status: "pending" },
    { photo: "IMG_4714.jpg", ocr: "A02B9", correct: "A0289", status: "corrected" },
    { photo: "IMG_4715.jpg", ocr: "B0l92", correct: "",      status: "pending" },
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-04" title="BIB Corrections" desc="Review photos where OCR detection was uncertain or incorrect. Enter the correct BIB number manually." />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Photo", "OCR Result", "Correct BIB", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.photo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.photo}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{r.ocr}</span>
                </td>
                <td style={{ padding: "10px" }}>
                  {r.status === "corrected" ? (
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#10B981" }}>{r.correct}</span>
                  ) : (
                    <input
                      defaultValue={r.correct}
                      placeholder="Enter BIB…"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 10px", color: "#fff", fontSize: "13px", fontFamily: "monospace", width: "100px" }}
                    />
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  <Badge label={r.status} type={r.status === "corrected" ? "green" : "amber"} />
                </td>
                <td style={{ padding: "10px", display: "flex", gap: "6px" }}>
                  {r.status === "pending" && <Btn label="Save" primary />}
                  <Btn label="View Photo" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Analytics() {
  const events = [
    { name: "Dalat Ultra Trail 2026", views: 14820, downloads: 3241, photos: 892 },
    { name: "HCM City Night Run",     views: 8430,  downloads: 1802, photos: 441 },
    { name: "Hanoi Spring 5K",        views: 3210,  downloads: 670,  photos: 188 },
  ];
  const topPhotos = [
    { file: "IMG_1042.jpg", views: 1204, downloads: 312 },
    { file: "IMG_0881.jpg", views: 988,  downloads: 244 },
    { file: "IMG_2201.jpg", views: 742,  downloads: 198 },
    { file: "IMG_0993.jpg", views: 610,  downloads: 155 },
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-05" title="Photo Analytics" desc="Track view and download counts for your photos across all events." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginBottom: "20px" }}>
        {events.map((ev) => (
          <Card key={ev.name}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px", marginBottom: "12px" }}>{ev.name}</div>
            {[
              { label: "👁️ Views",    value: ev.views.toLocaleString(),     max: 20000 },
              { label: "⬇️ Downloads",value: ev.downloads.toLocaleString(), max: 5000  },
              { label: "📷 Photos",   value: ev.photos.toLocaleString(),    max: 1000  },
            ].map((m) => (
              <div key={m.label} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
                  <span>{m.label}</span>
                  <span style={{ color: C, fontWeight: 700 }}>{m.value}</span>
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(parseInt(m.value.replace(/,/g, "")) / m.max) * 100}%`, background: `rgba(${CR},0.7)`, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>🏆 Top Photos</div>
        {topPhotos.map((p, i) => (
          <div key={p.file} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < topPhotos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#1E293B", width: "24px", textAlign: "center" }}>#{i + 1}</span>
            <span style={{ flex: 1, fontSize: "13px", color: "#94A3B8" }}>{p.file}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>👁️ {p.views.toLocaleString()}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>⬇️ {p.downloads.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function Publish() {
  const pending = [
    { count: 48, event: "Dalat Ultra Trail 2026", zone: "CP3", date: "2h ago"    },
    { count: 21, event: "Dalat Ultra Trail 2026", zone: "Finish", date: "3h ago" },
    { count: 14, event: "HCM City Night Run",     zone: "KM21",  date: "1d ago"  },
  ];
  return (
    <>
      <SectionHeader id="FR-PHO-06" title="Publish Photos" desc="Confirm and publish tagged photos so runners can search by BIB number. Unpublished photos are only visible to you." />
      {pending.map((batch, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: `rgba(${CR},0.12)`, border: `1px solid rgba(${CR},0.22)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: C }}>{batch.count}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px", marginBottom: "2px" }}>{batch.event} — {batch.zone}</div>
            <div style={{ fontSize: "12px", color: "#475569" }}>{batch.count} photos ready · uploaded {batch.date}</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn label="Preview" />
            <Btn label="Publish All" primary />
          </div>
        </Card>
      ))}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button style={{ padding: "10px 28px", borderRadius: "10px", background: `rgba(${CR},0.18)`, border: `1px solid rgba(${CR},0.3)`, color: C, fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
          🚀 Publish All Pending (83 photos)
        </button>
      </div>
    </>
  );
}

function Requests() {
  const reqs = [
    { id: "REQ-001", photo: "IMG_3821.jpg", type: "Remove",  runner: "BIB #A0042", reason: "Privacy concern",    status: "pending" },
    { id: "REQ-002", photo: "IMG_3822.jpg", type: "Edit",    runner: "BIB #B0117", reason: "Wrong BIB tagged",   status: "resolved"},
    { id: "REQ-003", photo: "IMG_3823.jpg", type: "Hide",    runner: "BIB #A0289", reason: "Unflattering image", status: "pending" },
    { id: "REQ-004", photo: "IMG_3824.jpg", type: "Remove",  runner: "BIB #C0055", reason: "Duplicate photo",    status: "pending" },
    { id: "REQ-005", photo: "IMG_3825.jpg", type: "Edit",    runner: "BIB #A0110", reason: "BIB correction",     status: "resolved"},
  ];
  const typeColor = (t: string) => t === "Remove" ? "rose" : t === "Hide" ? "amber" : "cyan";
  return (
    <>
      <SectionHeader id="FR-PHO-07" title="Edit / Hide / Remove Requests" desc="Process photo modification requests from runners, subject to the Organizer's content policy." />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["ID", "Photo", "Type", "Runner", "Reason", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px", fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>{r.id}</td>
                <td style={{ padding: "10px", fontSize: "13px", color: "#94A3B8" }}>{r.photo}</td>
                <td style={{ padding: "10px" }}><Badge label={r.type} type={typeColor(r.type) as "rose" | "amber" | "cyan"} /></td>
                <td style={{ padding: "10px", fontSize: "13px", color: C, fontWeight: 600 }}>{r.runner}</td>
                <td style={{ padding: "10px", fontSize: "12px", color: "#475569", maxWidth: "160px" }}>{r.reason}</td>
                <td style={{ padding: "10px" }}><Badge label={r.status} type={r.status === "resolved" ? "green" : "gray"} /></td>
                <td style={{ padding: "10px", display: "flex", gap: "6px" }}>
                  {r.status === "pending" && (
                    <>
                      <Btn label="Approve" primary />
                      <Btn label="Reject" />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

const sectionMap: Record<string, React.ReactNode> = {
  assignments: <Assignments />,
  upload:      <Upload />,
  ocr:         <OCR />,
  corrections: <Corrections />,
  analytics:   <Analytics />,
  publish:     <Publish />,
  requests:    <Requests />,
};

/* ── page ─────────────────────────────────────────────────────────── */
export default function PhotographerPage() {
  return (
    <DashboardShell
      role="Photographer"
      roleAbbr="PHO"
      roleIcon="📷"
      roleColor={C}
      roleColorRgb={CR}
      navItems={navItems}
      stats={stats}
    >
      {(active) => (
        <div className="animate-slide-up" key={active}>
          {sectionMap[active]}
        </div>
      )}
    </DashboardShell>
  );
}
