"use client";
import { useRouter } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import { PHOTO_COLOR, PHOTO_RGB, PhotoPage, usePhotoWorkspace } from "@/components/photographer/PhotoWorkspace";

export default function PhotographerAssignmentsPage() {
  const { assignments, selectEvent } = usePhotoWorkspace();
  const router = useRouter();
  return <PhotoPage tab="assignments" title="Phân công giải" description="Các giải bạn đang được ban tổ chức phân công làm nhiếp ảnh.">
    <div className="space-y-3">{assignments.map((item) => <Card key={item.eventId}>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-bold">{item.eventName}</h3><p className="my-2 text-sm text-[var(--text-secondary)]">{item.eventDate ? new Date(item.eventDate + "T00:00:00").toLocaleDateString("vi-VN") : "Chưa có ngày thi đấu"} · {item.stationLabel || "Chưa phân công khu vực"}</p><span className="text-xs font-semibold text-emerald-600">Phân công đang hoạt động</span></div><div className="flex flex-wrap gap-2"><Btn label="Tải ảnh cho giải" primary color={PHOTO_COLOR} colorRgb={PHOTO_RGB} onClick={() => { selectEvent(item.eventId); router.push("/upload"); }} /><Btn label="Xem ảnh của giải" onClick={() => { selectEvent(item.eventId); router.push("/ocr"); }} /></div></div>
    </Card>)}</div>
  </PhotoPage>;
}
