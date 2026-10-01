"use client";

import QrScannerSection from "@/components/sections/QrScannerSection";
import { RouteTab } from "@/context/ActiveTabContext";

export default function VolunteerScannerPage() {
  return (
    <RouteTab tab="scanner">
      <QrScannerSection
        sectionId="FR-VOL-01"
        title="QR / RFID Scanner"
        desc="Scan runner QR codes or RFID chips at the current checkpoint. Scans are logged in real-time."
        color="#10B981"
        colorRgb="16,185,129"
        roleLabel="Checkpoint"
      />
    </RouteTab>
  );
}
