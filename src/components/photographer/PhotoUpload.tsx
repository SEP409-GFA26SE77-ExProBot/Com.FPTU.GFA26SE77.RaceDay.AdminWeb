"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { bulkUploadPhotos } from "@/api/photographer";
import { photoUploadBatches, validatePhotoFiles } from "@/lib/photo-upload";
import { getApiErrorMessage } from "@/lib/error";
import { Btn, Card } from "@/components/ui";
import PhotoGallery from "./PhotoGallery";
import { PHOTO_COLOR, PHOTO_RGB, PhotoNotice, photoInputClass, usePhotoWorkspace } from "./PhotoWorkspace";

export default function PhotoUpload() {
  const { selected } = usePhotoWorkspace();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [zone, setZone] = useState(selected?.stationLabel || "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [revision, setRevision] = useState(0);
  const choose = (incoming: FileList | File[]) => {
    if (busy) return;
    const next = Array.from(incoming);
    const error = validatePhotoFiles(next);
    setNotice(error ? { text: error, error: true } : null);
    setFiles(error ? [] : next);
    setProgress(0);
  };
  const upload = async () => {
    const error = validatePhotoFiles(files);
    if (error || !selected || busy) { if (error) setNotice({ text: error, error: true }); return; }
    setBusy(true); setNotice(null); setProgress(0);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let accepted = 0, skipped = 0, finishedBytes = 0, finishedFiles = 0;
    try {
      for (const batch of photoUploadBatches(files)) {
        const result = await bulkUploadPhotos(selected.eventId, batch, zone, (loaded) => setProgress(Math.min(99, Math.round((finishedBytes + loaded) / totalBytes * 100))));
        accepted += result.accepted;
        skipped += result.skippedDuplicate;
        finishedBytes += batch.reduce((sum, file) => sum + file.size, 0);
        finishedFiles += batch.length;
      }
      setProgress(100); setFiles([]);
      if (input.current) input.current.value = "";
      setNotice({ text: `Tải lên hoàn tất: ${accepted} ảnh được nhận, ${skipped} ảnh trùng được bỏ qua. Mở Nhận diện BIB để bắt đầu xử lý.` });
    } catch (error) {
      setFiles((current) => current.slice(finishedFiles));
      setNotice({ text: `${getApiErrorMessage(error)} Đã nhận ${accepted} ảnh, bỏ qua ${skipped} ảnh trùng trước khi dừng. Bạn có thể thử lại các ảnh còn lại; ảnh đã nhận sẽ được kiểm tra trùng.`, error: true });
    } finally {
      setBusy(false); setRevision((value) => value + 1);
    }
  };
  return <div className="space-y-5">
    <Card>
      <label className="block text-sm font-semibold">Khu vực chụp (không bắt buộc)<input className={`${photoInputClass} mt-2 mb-4`} value={zone} maxLength={64} onChange={(event) => setZone(event.target.value)} disabled={busy} placeholder="Ví dụ: Xuất phát, CP1, Về đích" /></label>
      <div className="rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 p-8 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files); }}>
        <p className="mb-2 font-semibold">Kéo thả ảnh vào đây hoặc chọn từ máy tính</p>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">JPG, PNG, WebP · Tối đa 25 MB/ảnh · 500 ảnh/lần</p>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Chọn ảnh để tải lên" className="sr-only" disabled={busy} onChange={(event) => { if (event.target.files) choose(event.target.files); }} />
        <Btn label="Chọn ảnh" onClick={() => input.current?.click()} disabled={busy} />
      </div>
      {files.length > 0 && <div className="my-4"><p className="text-sm font-semibold">Đã chọn {files.length} ảnh · {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)} MB</p><ul className="mt-2 max-h-40 overflow-y-auto text-xs text-[var(--text-secondary)]">{files.map((file, index) => <li key={`${file.name}-${index}`} className="break-all py-1">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</li>)}</ul></div>}
      <div className="mt-4 flex flex-wrap items-center gap-3"><Btn primary color={PHOTO_COLOR} colorRgb={PHOTO_RGB} label={busy ? `Đang tải ${progress}%…` : "Tải ảnh lên"} onClick={() => void upload()} disabled={busy || !files.length} /><Link className="text-sm font-semibold text-cyan-600 underline" href="/ocr">Mở Nhận diện BIB</Link></div>
      {(busy || progress > 0) && <progress aria-label="Tiến độ tải ảnh" className="mt-3 w-full accent-cyan-500" max={100} value={progress} />}
      {notice && <PhotoNotice error={notice.error}>{notice.text}</PhotoNotice>}
    </Card>
    <PhotoGallery bucket="pending" revision={revision} />
  </div>;
}
