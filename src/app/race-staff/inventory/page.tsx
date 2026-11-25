"use client";

import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

const C = "#F59E0B";

export default function RaceStaffInventoryPage() {
  const stations = [
    { name: "Khu vực xuất phát", items: [{ name: "💧 Nước", qty: 850, max: 1000 }, { name: "🧂 Viên muối", qty: 620, max: 800 }, { name: "🍌 Gói gel", qty: 340, max: 400 }] },
    { name: "CP1 – KM10", items: [{ name: "💧 Nước", qty: 320, max: 600 }, { name: "🧂 Viên muối", qty: 80, max: 400 }, { name: "🍌 Gói gel", qty: 180, max: 300 }] },
    { name: "CP2 – KM21", items: [{ name: "💧 Nước", qty: 410, max: 600 }, { name: "🧂 Viên muối", qty: 290, max: 400 }, { name: "🍌 Gói gel", qty: 220, max: 300 }] },
    { name: "CP3 – KM32", items: [{ name: "💧 Nước", qty: 30, max: 500 }, { name: "🧂 Viên muối", qty: 120, max: 350 }, { name: "🍌 Gói gel", qty: 95, max: 250 }] },
  ];
  const pct = (q: number, m: number) => Math.round((q / m) * 100);
  const barColor = (p: number) => (p > 50 ? "#10B981" : p > 20 ? "#F59E0B" : "#EF4444");

  return (
    <RouteTab tab="inventory">
      <div className="animate-slide-up">
      <SectionHeader
        id="FR-OPS-04"
        title="Vật tư trạm tiếp tế"
        desc="Theo dõi lượng vật tư tại từng trạm tiếp tế. Hệ thống cảnh báo khi bất kỳ mặt hàng nào xuống dưới 20%."
        color={C}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "14px" }}>
        {stations.map((st) => {
          const hasAlert = st.items.some((i) => pct(i.qty, i.max) < 25);
          return (
            <Card key={st.name} style={{ borderColor: hasAlert ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{st.name}</div>
                {hasAlert && <Badge label="SẮP HẾT HÀNG" type="rose" />}
              </div>
              {st.items.map((item) => {
                const p = pct(item.qty, item.max);
                return (
                  <div key={item.name} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "#94A3B8" }}>{item.name}</span>
                      <span style={{ color: barColor(p), fontWeight: 700 }}>
                        {item.qty}/{item.max} <span style={{ color: "#334155" }}>({p}%)</span>
                      </span>
                    </div>
                    <div style={{ height: "5px", borderRadius: "2.5px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: barColor(p), borderRadius: "2.5px", transition: "width 1s" }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
                <Btn label="Yêu cầu bổ sung" primary small color="#F59E0B" colorRgb="245,158,11" />
                <Btn label="Cập nhật" small color="#F59E0B" colorRgb="245,158,11" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </RouteTab>
  );
}
