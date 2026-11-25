"use client";

import { SectionHeader, Card, Badge } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";

export default function RaceStaffContingencyPage() {
  const plans = [
    { code: "PLAN-A", name: "Rút ngắn cung đường dài", desc: "Chuyển VĐV cự ly 100km sang cung 50km từ CP3. Ảnh hưởng khoảng 340 VĐV.", risk: "Thời tiết / đường chạy hư hại", status: "ready" as const },
    { code: "PLAN-B", name: "Hủy cự ly dài", desc: "Hủy hoàn toàn cự ly 100km. Hoàn tiền một phần. Cần giám đốc giải phê duyệt.", risk: "Thời tiết khắc nghiệt", status: "ready" as const },
    { code: "PLAN-C", name: "Hủy toàn bộ giải", desc: "Hủy tất cả cự ly. Sơ tán toàn bộ checkpoint. Kích hoạt quy trình khẩn cấp.", risk: "Nguy hiểm nghiêm trọng về an toàn", status: "standby" as const },
  ];
  const log = [
    { time: "07:30", action: "Giải đã xuất phát — tất cả cự ly đang chạy", by: "Race-staff A" },
    { time: "09:00", action: "Đã phát cảnh báo thời tiết — Plan A sẵn sàng", by: "Race-staff A" },
    { time: "09:22", action: "SOS được kích hoạt tại KM 28.4 — đã điều động y tế", by: "Hệ thống" },
  ];

  return (
    <RouteTab tab="contingency">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-OPS-05"
        title="Phương án dự phòng"
        desc="Kích hoạt phương án dự phòng theo tình hình giải. Mọi lần kích hoạt đều được ghi vào nhật ký sự kiện."
        color={C}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {plans.map((plan) => (
          <Card key={plan.code} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              🔴
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{plan.code}: {plan.name}</span>
                <Badge label={plan.status === "ready" ? "Sẵn sàng" : "Chờ lệnh"} type={plan.status === "ready" ? "amber" : "gray"} />
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 6px", lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ fontSize: "11px", color: "#334155" }}>⚠️ Điều kiện kích hoạt: {plan.risk}</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
              Kích hoạt
            </button>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>
          📋 Nhật ký sự kiện
        </div>
        {log.map((entry, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", padding: "10px 0", borderBottom: i < log.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ fontSize: "12px", fontFamily: "monospace", color: C, flexShrink: 0, paddingTop: "1px" }}>{entry.time}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>{entry.action}</div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "2px" }}>bởi {entry.by}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
    </RouteTab>
  );
}
