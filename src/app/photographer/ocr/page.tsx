"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import PhotoProcessing from "@/components/photographer/PhotoProcessing";

export default function PhotographerOcrPage() {
  return <PhotoPage tab="ocr" title="Nhận diện BIB" description="Theo dõi xử lý ảnh, kết quả khớp BIB và ảnh cần kiểm tra."><PhotoProcessing /></PhotoPage>;
}
