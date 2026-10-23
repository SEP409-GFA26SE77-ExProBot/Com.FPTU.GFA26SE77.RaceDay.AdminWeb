"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import PhotoGallery from "@/components/photographer/PhotoGallery";

export default function PhotographerCorrectionsPage() {
  return <PhotoPage tab="corrections" title="Sửa BIB" description="Kiểm tra ảnh nhận diện chưa chắc chắn hoặc bị khiếu nại. Nhập BIB chính xác của người chạy."><PhotoGallery bucket="review" /></PhotoPage>;
}
