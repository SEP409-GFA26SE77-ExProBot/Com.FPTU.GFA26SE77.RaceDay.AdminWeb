"use client";
import { PhotoPage } from "@/components/photographer/PhotoWorkspace";
import { PhotoStatistics } from "@/components/photographer/PhotoOverview";

export default function PhotographerAnalyticsPage() {
  return <PhotoPage tab="analytics" title="Thống kê ảnh" description="Số lượng ảnh thực tế theo nhóm xử lý, kết quả khớp BIB và hàng đợi kiểm tra."><PhotoStatistics /></PhotoPage>;
}
