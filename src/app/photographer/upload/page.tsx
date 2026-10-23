"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import PhotoUpload from "@/components/photographer/PhotoUpload";

export default function PhotographerUploadPage() {
  return <PhotoPage tab="upload" title="Tải ảnh lên" description="Tải ảnh cho giải được phân công, sau đó bắt đầu nhận diện BIB."><PhotoUpload /></PhotoPage>;
}
