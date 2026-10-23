"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import { SearchablePhotoGallery } from "@/components/photographer/PhotoOverview";

export default function PhotographerPublishPage() {
  return <PhotoPage tab="publish" title="Ảnh có thể tìm kiếm" description="Xem ảnh đã khớp BIB và kiểm tra kết quả tìm kiếm của người chạy."><SearchablePhotoGallery /></PhotoPage>;
}
