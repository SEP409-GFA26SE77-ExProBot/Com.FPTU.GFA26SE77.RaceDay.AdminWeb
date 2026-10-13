"use client";

import { useState } from "react";
import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import QrScannerModal from "@/components/QrScannerModal";

interface QrScannerSectionProps {
  sectionId?: string;
  title?: string;
  desc?: string;
  color?: string;
  colorRgb?: string;
  roleLabel?: string;
}

export function QrScannerSection({
  sectionId = "FR-SCAN-01",
  title = "QR / RFID Scanner",
  desc = "Scan runner QR codes or RFID chips at the current checkpoint. Scans are logged in real-time.",
  color = "#10B981",
  colorRgb = "16,185,129",
  roleLabel = "Checkpoint",
}: QrScannerSectionProps) {
  const checkpoints = [
    "Start Gate",
    "CP1 – KM 10",
    "CP2 – KM 21",
    "CP3 – KM 32",
    "CP4 – KM 50",
    "Finish Line",
  ];
  const [selectedCp, setSelectedCp] = useState("CP1 – KM 10");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [recentScans, setRecentScans] = useState([
    { bib: "A0042", runner: "Nguyen Van A", time: "09:14:32", cp: "CP1", status: "ok" },
    { bib: "B0117", runner: "Tran Thi B", time: "09:14:28", cp: "CP1", status: "ok" },
    { bib: "C0055", runner: "Le Van C", time: "09:14:01", cp: "CP1", status: "ok" },
    { bib: "A0289", runner: "Pham Thi D", time: "09:13:47", cp: "CP1", status: "dup" },
    { bib: "A0110", runner: "Hoang Van E", time: "09:13:30", cp: "CP1", status: "ok" },
  ]);
  const [lastNotification, setLastNotification] = useState<{
    bib: string;
    text: string;
    isDup: boolean;
  } | null>(null);

  const processBibScan = (rawCode: string) => {
    const bibCode = rawCode.trim().toUpperCase();
    if (!bibCode) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const cpTag = selectedCp.split(" ")[0];
    const isDuplicate = recentScans.some((s) => s.bib === bibCode && s.cp === cpTag);

    const newScan = {
      bib: bibCode,
      runner: `Runner ${bibCode}`,
      time: timeStr,
      cp: cpTag,
      status: isDuplicate ? "dup" : "ok",
    };

    setRecentScans((prev) => [newScan, ...prev]);
    setLastNotification({
      bib: bibCode,
      text: isDuplicate
        ? `Duplicate scan detected at ${cpTag}`
        : `Successfully logged at ${cpTag}`,
      isDup: isDuplicate,
    });
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) return;
    processBibScan(manualInput);
    setManualInput("");
  };

  return (
    <div className="animate-slide-up">
      <SectionHeader id={sectionId} title={title} desc={desc} color={color} />

      {lastNotification && (
        <div
          className="animate-slide-up"
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: lastNotification.isDup
              ? "rgba(239,68,68,0.12)"
              : `rgba(${colorRgb},0.12)`,
            border: `1px solid ${
              lastNotification.isDup ? "rgba(239,68,68,0.3)" : `rgba(${colorRgb},0.3)`
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>{lastNotification.isDup ? "⚠️" : "✅"}</span>
            <div>
              <span
                style={{
                  fontWeight: 800,
                  color: lastNotification.isDup ? "#EF4444" : color,
                  fontFamily: "monospace",
                  fontSize: "14px",
                }}
              >
                {lastNotification.bib}
              </span>
              <span style={{ color: "#94A3B8", fontSize: "12px", marginLeft: "8px" }}>
                {lastNotification.text}
              </span>
            </div>
          </div>
          <button
            onClick={() => setLastNotification(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Scanner Action Card */}
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
            Active {roleLabel} Location
          </div>
          <select
            value={selectedCp}
            onChange={(e) => setSelectedCp(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "9px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              fontSize: "13px",
              marginBottom: "16px",
              cursor: "pointer",
            }}
          >
            {checkpoints.map((cp) => (
              <option key={cp} value={cp} style={{ background: "#0B0A14" }}>
                {cp}
              </option>
            ))}
          </select>

          {/* Action Trigger Box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "26px 20px",
              background: `linear-gradient(180deg, rgba(${colorRgb},0.08) 0%, rgba(${colorRgb},0.02) 100%)`,
              border: `2px dashed rgba(${colorRgb},0.35)`,
              borderRadius: "14px",
              marginBottom: "16px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: `rgba(${colorRgb},0.16)`,
                  border: `2px solid rgba(${colorRgb},0.5)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                }}
              >
                📡
              </div>
              <div
                className="animate-ping-slow"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  opacity: 0.4,
                }}
              />
            </div>

            <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
              {roleLabel} Scanner Ready
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px", maxWidth: "260px" }}>
              Launch camera to scan runner QR codes or RFID barcodes automatically.
            </p>

            <button
              onClick={() => setIsScannerOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 22px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${color}, #059669)`,
                border: "none",
                color: "#000",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 4px 18px rgba(${colorRgb},0.35)`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 24px rgba(${colorRgb},0.45)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 18px rgba(${colorRgb},0.35)`;
              }}
            >
              <span>📷</span>
              <span>Open QR Scanner Modal</span>
            </button>
          </div>

          {/* Manual input override */}
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Manual BIB override (e.g. A0042)…"
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
                fontSize: "13px",
              }}
            />
            <Btn
              label="Submit"
              primary
              color={color}
              colorRgb={colorRgb}
              onClick={handleManualSubmit}
            />
          </form>
        </Card>

        {/* Recent Scans Feed */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Recent Scans ({recentScans.length})
            </div>
            <button
              onClick={() => setRecentScans([])}
              style={{
                background: "transparent",
                border: "none",
                color: "#475569",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ maxHeight: "330px", overflowY: "auto" }}>
            {recentScans.map((s, idx) => (
              <div
                key={s.bib + s.time + idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9px",
                    background:
                      s.status === "dup" ? "rgba(239,68,68,0.12)" : `rgba(${colorRgb},0.12)`,
                    border: `1px solid ${
                      s.status === "dup" ? "rgba(239,68,68,0.25)" : `rgba(${colorRgb},0.25)`
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: s.status === "dup" ? "#EF4444" : color,
                    flexShrink: 0,
                    fontFamily: "monospace",
                  }}
                >
                  {s.bib.length > 3 ? s.bib.slice(-3) : s.bib}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.bib} <span style={{ color: "#475569", fontWeight: 400 }}>· {s.runner}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#334155" }}>
                    {s.time} · {s.cp}
                  </div>
                </div>
                {s.status === "dup" ? (
                  <Badge label="DUPLICATE" type="rose" />
                ) : (
                  <Badge label="LOGGED" type="green" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={processBibScan}
        title={`${roleLabel} QR Scanner`}
        subtitle={`Scanning at location: ${selectedCp}`}
        themeColor={color}
        themeRgb={colorRgb}
      />
    </div>
  );
}

export default QrScannerSection;
