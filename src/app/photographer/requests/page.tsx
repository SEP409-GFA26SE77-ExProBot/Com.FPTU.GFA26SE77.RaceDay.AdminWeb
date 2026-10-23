"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import PhotoDisputes from "@/components/photographer/PhotoDisputes";

export default function PhotographerRequestsPage() {
  return <PhotoPage tab="requests" title="Khiếu nại ảnh" description="Xem khiếu nại từ người chạy, chấp nhận để kiểm tra BIB hoặc từ chối kèm lý do."><PhotoDisputes /></PhotoPage>;
}
