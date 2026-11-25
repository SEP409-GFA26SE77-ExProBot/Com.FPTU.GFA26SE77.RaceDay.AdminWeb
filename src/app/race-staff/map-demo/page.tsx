"use client";

import { SectionHeader } from "@/components/ui";
import RaceRouteMap from "@/components/sections/RaceRouteMap";
import type { Coordinate, Checkpoint } from "@/components/sections/RaceRouteMap";

// ─── Sample race route: a ~10K loop around Hoan Kiem Lake area, Hanoi ───────
const DEMO_ROUTE: Coordinate[] = [
  { lat: 21.0285, lng: 105.8542 },  // Start – Ly Thai To Statue
  { lat: 21.0290, lng: 105.8555 },
  { lat: 21.0300, lng: 105.8565 },
  { lat: 21.0312, lng: 105.8570 },
  { lat: 21.0325, lng: 105.8568 },
  { lat: 21.0335, lng: 105.8558 },  // North of lake
  { lat: 21.0340, lng: 105.8542 },
  { lat: 21.0338, lng: 105.8525 },
  { lat: 21.0328, lng: 105.8510 },
  { lat: 21.0315, lng: 105.8498 },
  { lat: 21.0300, lng: 105.8490 },  // West arc
  { lat: 21.0285, lng: 105.8488 },
  { lat: 21.0270, lng: 105.8495 },
  { lat: 21.0258, lng: 105.8508 },
  { lat: 21.0250, lng: 105.8520 },
  { lat: 21.0248, lng: 105.8535 },  // South of lake
  { lat: 21.0252, lng: 105.8548 },
  { lat: 21.0258, lng: 105.8558 },
  { lat: 21.0268, lng: 105.8565 },
  { lat: 21.0278, lng: 105.8560 },
  { lat: 21.0285, lng: 105.8542 },  // Return to start
];

const DEMO_START: Coordinate = { lat: 21.0285, lng: 105.8542 };
const DEMO_FINISH: Coordinate = { lat: 21.0285, lng: 105.8542 }; // loop course

const DEMO_CHECKPOINTS: Checkpoint[] = [
  {
    id: "cp-1",
    name: "Trạm nước số 1",
    latitude: 21.0335,
    longitude: 105.8558,
    distanceFromStart: 2500,
    type: "WATER",
    description: "Điểm cấp nước phía bắc hồ. Có nước uống thể thao và nước lọc.",
  },
  {
    id: "cp-2",
    name: "Thảm bấm giờ A",
    latitude: 21.0300,
    longitude: 105.8490,
    distanceFromStart: 5000,
    type: "TIMING",
    description: "Thảm bấm giờ mốc 5K. Kết quả cập nhật trực tiếp.",
  },
  {
    id: "cp-3",
    name: "Trạm y tế",
    latitude: 21.0250,
    longitude: 105.8520,
    distanceFromStart: 7200,
    type: "MEDICAL",
    description: "Lều y tế đầy đủ với AED, sơ cứu và hỗ trợ vật lý trị liệu.",
  },
  {
    id: "cp-4",
    name: "Checkpoint B",
    latitude: 21.0268,
    longitude: 105.8565,
    distanceFromStart: 9000,
    type: "CHECKPOINT",
    description: "Checkpoint cuối trước vạch đích. Có tình nguyện viên điều phối tại chỗ.",
  },
];

export default function MapDemoPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <SectionHeader
        id="MAP-DEMO"
        title="Bản đồ cung đường — Demo thành phần"
        desc="Bản đồ Leaflet tương tác hiển thị cung đường mẫu 10K quanh hồ Hoàn Kiếm, Hà Nội cùng các checkpoint, điểm xuất phát/về đích và nền bản đồ OSM."
        color="#8B5CF6"
      />

      <div style={{ marginTop: 20 }}>
        <RaceRouteMap
          route={DEMO_ROUTE}
          startPoint={DEMO_START}
          finishPoint={DEMO_FINISH}
          checkpoints={DEMO_CHECKPOINTS}
          height="600px"
        />
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {[
          { color: "#10B981", label: "Xuất phát" },
          { color: "#EF4444", label: "Về đích" },
          { color: "#8B5CF6", label: "Checkpoint", square: true },
          { color: "#3B82F6", label: "Nước", square: true },
          { color: "#F59E0B", label: "Bấm giờ", square: true },
          { color: "#EF4444", label: "Y tế", square: true },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "square" in l ? 3 : "50%",
                background: l.color,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
