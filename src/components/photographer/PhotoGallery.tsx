"use client";

import Image from "next/image";
import { useCallback, useState, type FormEvent } from "react";
import { correctPhotoBib, getPhotoDetail, listPhotographerPhotos, searchPhotosByBib } from "@/api/photographer";
import type { PhotoBucket, PhotoDetail, PhotoListItem, PhotoStatus } from "@/dto/photo.dto";
import { usePhotoQuery } from "@/hooks/use-photo-query";
import { getApiErrorMessage } from "@/lib/error";
import { mediaOpenUrl } from "@/lib/media-url";
import { Btn, Card } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PHOTO_COLOR, PHOTO_RGB, PhotoNotice, photoInputClass, usePhotoWorkspace } from "./PhotoWorkspace";

const statusNames: Record<PhotoStatus, string> = {
  pending: "Chờ xử lý", queued: "Đang xếp hàng", processing: "Đang nhận diện", matched: "Đã khớp BIB", needs_review: "Cần kiểm tra", manual_corrected: "Đã sửa BIB", discarded: "Đã loại", failed: "Xử lý thất bại", runner_reported: "Có khiếu nại",
};

export function PhotoStatusBadge({ status }: { status: PhotoStatus }) {
  const color = status === "failed" ? "border-red-500/30 bg-red-500/10" : ["needs_review", "runner_reported"].includes(status) ? "border-amber-500/30 bg-amber-500/10" : ["matched", "manual_corrected"].includes(status) ? "border-emerald-500/30 bg-emerald-500/10" : "border-cyan-500/30 bg-cyan-500/10";
  return <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] ${color}`}>{statusNames[status] || status}</span>;
}

function PhotoImage({ photo, large = false }: { photo: PhotoListItem; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-500/10 ${large ? "h-[min(55vh,500px)]" : "aspect-[4/3]"}`}>
    {failed ? <span className="p-4 text-sm text-[var(--text-secondary)]">Không tải được ảnh.</span> : <Image unoptimized fill sizes={large ? "90vw" : "400px"} className="object-contain" src={mediaOpenUrl(photo.url)} alt={`Ảnh ${photo.tags.map((tag) => `BIB ${tag.bib}`).join(", ") || photo.id}`} onError={() => setFailed(true)} />}
  </div>;
}

export function PhotoPreview({ photo, onClose }: { photo: PhotoListItem; onClose: () => void }) {
  const load = useCallback((): Promise<PhotoDetail> => ["matched", "manual_corrected", "runner_reported"].includes(photo.status)
    ? getPhotoDetail(photo.id)
    : Promise.resolve({ ...photo, originalFileName: null, discardReason: null, updatedAtUtc: photo.createdAtUtc }), [photo]);
  const query = usePhotoQuery(photo.id, load);
  const details = query.data;
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
    <DialogTitle>{details?.originalFileName || "Chi tiết ảnh"}</DialogTitle>
    <DialogDescription>Ảnh và kết quả nhận diện BIB của giải.</DialogDescription>
    <PhotoImage photo={details || photo} large />
    {query.loading && <PhotoNotice>Đang tải chi tiết…</PhotoNotice>}
    {query.error && <PhotoNotice error>{query.error}</PhotoNotice>}
    <PhotoStatusBadge status={details?.status || photo.status} />
    <p className="break-all text-xs text-[var(--text-secondary)]">Mã ảnh: {photo.id}</p>
    <p className="text-sm">Khu vực: {photo.zone || "Chưa ghi nhận"} · Tải lên: {new Date(photo.createdAtUtc).toLocaleString("vi-VN")}</p>
    {(details?.tags || photo.tags).map((tag) => <p key={`${tag.bib}-${tag.source}`} className="text-sm">BIB <strong>{tag.bib}</strong> · {(tag.confidence * 100).toFixed(1)}% · {tag.source === "manual" ? "Sửa thủ công" : "OCR"}</p>)}
    {details?.discardReason && <PhotoNotice error>{details.discardReason}</PhotoNotice>}
    <a className="text-sm font-semibold text-cyan-600 underline" href={mediaOpenUrl(photo.url)} target="_blank" rel="noreferrer">Mở ảnh gốc</a>
  </DialogContent></Dialog>;
}

function BibCorrection({ photo, busy, disabled, onSave }: { photo: PhotoListItem; busy: boolean; disabled: boolean; onSave: (bib: string) => void }) {
  const [bib, setBib] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (bib.trim() && !disabled) onSave(bib); };
  return <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2">
    <label className="min-w-0 flex-1 text-xs font-semibold">BIB chính xác
      <input aria-label={`BIB chính xác cho ảnh ${photo.id}`} className={`${photoInputClass} mt-1`} value={bib} onChange={(event) => setBib(event.target.value)} maxLength={30} required placeholder="Nhập BIB đã xác nhận" disabled={disabled} />
    </label>
    <Btn label={busy ? "Đang lưu…" : "Lưu BIB"} primary color={PHOTO_COLOR} colorRgb={PHOTO_RGB} type="submit" disabled={disabled || !bib.trim()} />
  </form>;
}

export function PhotoPagination({ page, pageSize, total, loading, onPage }: { page: number; pageSize: number; total: number; loading: boolean; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
    <span>{total.toLocaleString("vi-VN")} ảnh · Trang {page}/{pages}</span>
    <div className="flex gap-2"><Btn label="Trang trước" disabled={loading || page <= 1} onClick={() => onPage(page - 1)} /><Btn label="Trang sau" disabled={loading || page >= pages} onClick={() => onPage(page + 1)} /></div>
  </div>;
}

export default function PhotoGallery({ bucket, bib = "", revision = 0 }: { bucket: PhotoBucket; bib?: string; revision?: number }) {
  const { selected } = usePhotoWorkspace();
  const eventId = selected?.eventId || "";
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<PhotoListItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const load = useCallback(() => bib ? searchPhotosByBib(eventId, bib, page) : listPhotographerPhotos(eventId, bucket, page), [eventId, bucket, page, bib]);
  const query = usePhotoQuery(`${eventId}:${bucket}:${bib}:${page}:${revision}`, load, bucket === "pending" ? 5000 : 0);
  const save = async (photo: PhotoListItem, bib: string) => {
    setBusyId(photo.id); setNotice(null);
    try {
      await correctPhotoBib(eventId, photo.id, bib);
      setNotice({ text: `Đã sửa BIB thành ${bib.trim().toUpperCase()}. Ảnh đã có thể tìm kiếm.` });
      setPage(1);
      query.reload();
    } catch (error) { setNotice({ text: getApiErrorMessage(error), error: true }); }
    finally { setBusyId(null); }
  };
  return <div>
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold">{bib ? `Kết quả cho BIB ${bib}` : bucket === "pending" ? "Ảnh chờ / đang xử lý" : bucket === "review" ? "Ảnh cần sửa BIB" : "Ảnh đã khớp BIB"}</h3><Btn label="Làm mới ảnh" onClick={query.reload} disabled={query.loading || Boolean(busyId)} /></div>
    {notice && <PhotoNotice error={notice.error}>{notice.text}</PhotoNotice>}
    {query.error && <PhotoNotice error>{query.error}</PhotoNotice>}
    {query.loading && <PhotoNotice>Đang tải ảnh…</PhotoNotice>}
    {!query.loading && !query.error && !query.data?.items.length && <Card><p className="text-sm text-[var(--text-secondary)]">{bib ? "Không có ảnh khớp BIB này." : "Chưa có ảnh trong danh sách này."}</p></Card>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {query.data?.items.map((photo) => <Card key={photo.id} style={{ padding: "14px" }}>
        <button type="button" className="block w-full cursor-pointer" aria-label={`Xem ảnh ${photo.id}`} onClick={() => setPreview(photo)}><PhotoImage photo={photo} /></button>
        <div className="mt-3"><PhotoStatusBadge status={photo.status} /></div>
        <p className="mt-2 truncate text-sm font-semibold">{photo.zone || "Chưa ghi khu vực"}</p>
        <p className="my-1 text-xs text-[var(--text-secondary)]">{new Date(photo.createdAtUtc).toLocaleString("vi-VN")}</p>
        <div className="my-2 flex flex-wrap gap-1">{photo.tags.length ? photo.tags.map((tag) => <span key={`${tag.bib}-${tag.source}`} className="rounded bg-cyan-500/10 px-2 py-1 text-xs">{tag.bib} · {(tag.confidence * 100).toFixed(1)}% · {tag.source === "manual" ? "Thủ công" : "OCR"}</span>) : <span className="text-xs text-[var(--text-secondary)]">Chưa có BIB</span>}</div>
        <Btn label="Xem ảnh" onClick={() => setPreview(photo)} />
        {bucket === "review" && <BibCorrection photo={photo} busy={busyId === photo.id} disabled={Boolean(busyId)} onSave={(bib) => void save(photo, bib)} />}
      </Card>)}
    </div>
    {query.data && <PhotoPagination page={page} pageSize={query.data.pageSize} total={query.data.total} loading={query.loading || Boolean(busyId)} onPage={setPage} />}
    {preview && <PhotoPreview photo={preview} onClose={() => setPreview(null)} />}
  </div>;
}
