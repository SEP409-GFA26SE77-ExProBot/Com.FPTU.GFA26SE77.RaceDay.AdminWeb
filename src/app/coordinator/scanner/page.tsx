"use client";

import QrScannerSection from "@/components/sections/QrScannerSection";
import { RouteTab } from "@/context/ActiveTabContext";

export default function CoordinatorScannerPage() {
  return (
    <RouteTab tab="scanner">
      <QrScannerSection
        sectionId="FR-OPS-00"
        title="Coordinator QR / RFID Scanner"
        desc="Scan runner QR codes or RFID chips at any checkpoint or control zone. Scans are synchronized in real-time."
        color="#F59E0B"
        colorRgb="245,158,11"
        roleLabel="Control Zone"
      />
    </RouteTab>
  );
}
