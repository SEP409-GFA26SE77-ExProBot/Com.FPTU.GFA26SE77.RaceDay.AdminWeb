"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { approvePhotoDispute, getPhotoDetail, listPhotoDisputes, rejectPhotoDispute } from "@/api/photographer";
import type { PhotoDispute, PhotoListItem } from "@/dto/photo.dto";
import { usePhotoQuery } from "@/hooks/use-photo-query";
import { getApiErrorMessage } from "@/lib/error";
import { Btn, Card } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PhotoPreview } from "./PhotoGallery";
import { PHOTO_COLOR, PHOTO_RGB, PhotoNotice, photoInputClass, usePhotoWorkspace } from "./PhotoWorkspace";

export default function PhotoDisputes() {
  const { selected } = usePhotoWorkspace();
  const eventId = selected?.eventId || "";
  const load = useCallback(() => listPhotoDisputes(eventId), [eventId]);
  const query = usePhotoQuery(eventId, load);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [rejecting, setRejecting] = useState<PhotoDispute | null>(null);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<PhotoListItem | null>(null);
  const review = async (dispute: PhotoDispute, action: "approve" | "reject") => {
    if (busy || (action === "reject" && !reason.trim())) return;
    setBusy(true); setNotice(null);
    try {
      if (action === "approve") await approvePhotoDispute(eventId, dispute.id);
      else await rejectPhotoDispute(eventId, dispute.id, reason);
      setRejecting(null); setReason("");
      setNotice({ text: action === "approve" ? "Đã chấp nhận khiếu nại. Mở Sửa BIB để kiểm tra và cập nhật ảnh." : "Đã từ chối khiếu nại và lưu lý do." });
      query.reload();
    } catch (error) { setNotice({ text: getApiErrorMessage(error), error: true }); }
    finally { setBusy(false); }
  };
  const viewPhoto = async (photoId: string) => {
    if (busy) return;
    setBusy(true);
    try { setPreview(await getPhotoDetail(photoId)); }
    catch (error) { setNotice({ text: getApiErrorMessage(error), error: true }); }
    finally { setBusy(false); }
  };
  const submitReject = (event: FormEvent) => { event.preventDefault(); if (rejecting) void review(rejecting, "reject"); };
  return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{query.data?.length ?? 0} khiếu nại đang mở</p><div className="flex gap-3"><Link className="text-sm text-cyan-600 underline" href="/corrections">Mở Sửa BIB</Link><Btn label="Làm mới khiếu nại" disabled={query.loading || busy} onClick={query.reload} /></div></div>
    {notice && <PhotoNotice error={notice.error}>{notice.text}</PhotoNotice>}
    {query.error && <PhotoNotice error>{query.error}</PhotoNotice>}
    {query.loading && <PhotoNotice>Đang tải khiếu nại…</PhotoNotice>}
    {!query.loading && !query.error && !query.data?.length && <Card><p className="text-sm text-[var(--text-secondary)]">Không có khiếu nại đang mở cho giải này.</p></Card>}
    <div className="space-y-3">{query.data?.map((dispute) => <Card key={dispute.id}>
      <p className="font-semibold">Khiếu nại về ảnh</p><p className="mt-1 break-all font-mono text-xs text-[var(--text-secondary)]">{dispute.photoId}</p>
      <p className="my-3 whitespace-pre-wrap break-words text-sm">{dispute.reason}</p><p className="mb-3 text-xs text-[var(--text-secondary)]">{new Date(dispute.createdAtUtc).toLocaleString("vi-VN")} · Đang mở</p>
      <div className="flex flex-wrap gap-2"><Btn label="Xem ảnh" disabled={busy} onClick={() => void viewPhoto(dispute.photoId)} /><Btn label="Chấp nhận khiếu nại" primary color={PHOTO_COLOR} colorRgb={PHOTO_RGB} disabled={busy} onClick={() => void review(dispute, "approve")} /><Btn label="Từ chối" danger disabled={busy} onClick={() => { setRejecting(dispute); setReason(""); setNotice(null); }} /></div>
    </Card>)}</div>
    {preview && <PhotoPreview photo={preview} onClose={() => setPreview(null)} />}
    <Dialog open={Boolean(rejecting)} onOpenChange={(open) => { if (!open && !busy) setRejecting(null); }}><DialogContent>
      <DialogTitle>Từ chối khiếu nại</DialogTitle><DialogDescription>Ghi lý do để người gửi biết kết quả xem xét.</DialogDescription>
      <form onSubmit={submitReject} className="space-y-4"><label className="block text-sm font-semibold">Lý do từ chối<textarea aria-label="Lý do từ chối" className={`${photoInputClass} mt-2 min-h-28`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} required disabled={busy} /></label>
        {notice?.error && <PhotoNotice error>{notice.text}</PhotoNotice>}
        <div className="flex gap-2"><Btn type="submit" label={busy ? "Đang lưu…" : "Xác nhận từ chối"} danger disabled={busy || !reason.trim()} /><Btn label="Hủy" disabled={busy} onClick={() => setRejecting(null)} /></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}
