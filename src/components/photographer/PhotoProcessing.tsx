"use client";

import { useState } from "react";
import { processPendingPhotos } from "@/api/photographer";
import { getApiErrorMessage } from "@/lib/error";
import { Btn, Card } from "@/components/ui";
import type { PhotoBucket } from "@/dto/photo.dto";
import PhotoGallery from "./PhotoGallery";
import { PHOTO_COLOR, PHOTO_RGB, PhotoNotice, usePhotoWorkspace } from "./PhotoWorkspace";

export default function PhotoProcessing() {
  const { selected } = usePhotoWorkspace();
  const [bucket, setBucket] = useState<PhotoBucket>("pending");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [revision, setRevision] = useState(0);
  const process = async () => {
    if (!selected || busy) return;
    setBusy(true); setNotice(null);
    try {
      const result = await processPendingPhotos(selected.eventId);
      setNotice({ text: result.queuedCount ? `Đã đưa ${result.queuedCount} ảnh vào hàng đợi nhận diện. Ảnh chờ và thất bại được xử lý tối đa 500 ảnh mỗi lần.` : "Không có ảnh chờ hoặc thất bại cần đưa vào hàng đợi." });
      setRevision((value) => value + 1);
    } catch (error) { setNotice({ text: getApiErrorMessage(error), error: true }); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5">
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold">Nhận diện BIB từ ảnh</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Bắt đầu OCR cho ảnh chờ hoặc thử lại ảnh xử lý thất bại. Danh sách đang xử lý tự cập nhật mỗi 5 giây.</p></div><Btn label={busy ? "Đang gửi…" : "Bắt đầu / Thử lại OCR"} primary color={PHOTO_COLOR} colorRgb={PHOTO_RGB} disabled={busy} onClick={() => void process()} /></div>
      {notice && <PhotoNotice error={notice.error}>{notice.text}</PhotoNotice>}
    </Card>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Nhóm trạng thái ảnh">
      {([ ["pending", "Chờ / Đang xử lý"], ["matched", "Đã khớp BIB"], ["review", "Cần kiểm tra"] ] as const).map(([value, label]) => <Btn key={value} label={label} primary={bucket === value} color={PHOTO_COLOR} colorRgb={PHOTO_RGB} onClick={() => setBucket(value)} />)}
    </div>
    <PhotoGallery key={bucket} bucket={bucket} revision={revision} />
  </div>;
}
