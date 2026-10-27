"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { listPhotographerPhotos } from "@/api/photographer";
import { usePhotoQuery } from "@/hooks/use-photo-query";
import { Btn, Card } from "@/components/ui";
import PhotoGallery from "./PhotoGallery";
import { PhotoNotice, photoInputClass, usePhotoWorkspace } from "./PhotoWorkspace";

export function PhotoStatistics() {
  const { selected } = usePhotoWorkspace();
  const eventId = selected?.eventId || "";
  const load = useCallback(async () => {
    const [pending, matched, review] = await Promise.all([listPhotographerPhotos(eventId, "pending", 1, 1), listPhotographerPhotos(eventId, "matched", 1, 1), listPhotographerPhotos(eventId, "review", 1, 1)]);
    return { pending: pending.total, matched: matched.total, review: review.total };
  }, [eventId]);
  const query = usePhotoQuery(eventId, load, 15000);
  return <div>
    <div className="mb-4 flex justify-end"><Btn label="Làm mới thống kê" onClick={query.reload} disabled={query.loading} /></div>
    {query.loading && <PhotoNotice>Đang tải thống kê…</PhotoNotice>}{query.error && <PhotoNotice error>{query.error}</PhotoNotice>}
    {query.data && <div className="grid gap-4 sm:grid-cols-3">{[
      { label: "Chờ / Đang xử lý / Thất bại", value: query.data.pending, href: "/ocr" },
      { label: "Đã khớp / Đã sửa BIB", value: query.data.matched, href: "/publish" },
      { label: "Cần kiểm tra / Có khiếu nại", value: query.data.review, href: "/corrections" },
    ].map((item) => <Card key={item.href}><p className="text-3xl font-bold text-cyan-600">{item.value.toLocaleString("vi-VN")}</p><p className="my-3 text-sm">{item.label}</p><Link className="text-sm font-semibold text-cyan-600 underline" href={item.href}>Xem danh sách</Link></Card>)}</div>}
    <p className="mt-4 text-sm text-[var(--text-secondary)]">Số lượng theo trạng thái hiện tại của giải; ảnh đã loại không nằm trong các nhóm này.</p>
  </div>;
}

export function SearchablePhotoGallery() {
  const [input, setInput] = useState("");
  const [bib, setBib] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); setBib(input.trim().toUpperCase()); };
  return <div className="space-y-5">
    <Card><p className="text-sm text-[var(--text-secondary)]">Ảnh đã khớp hoặc đã sửa BIB tự động xuất hiện khi người chạy tìm kiếm. Ảnh cần kiểm tra và ảnh bị khiếu nại không nằm trong kết quả tìm kiếm.</p>
      <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm font-semibold">Tìm ảnh theo BIB<input aria-label="Tìm ảnh theo BIB" className={`${photoInputClass} mt-2`} value={input} maxLength={30} onChange={(event) => setInput(event.target.value)} placeholder="Nhập BIB hoặc để trống để xem tất cả" /></label><Btn type="submit" label="Tìm ảnh" /><Btn label="Xem tất cả" onClick={() => { setInput(""); setBib(""); }} /></form>
    </Card>
    <PhotoGallery key={bib} bucket="matched" bib={bib} />
  </div>;
}
