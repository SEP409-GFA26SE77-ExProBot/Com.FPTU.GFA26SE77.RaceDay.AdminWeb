"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ErrorAuthorization() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
      <h1 className="mb-0 text-[12vmin] font-bold text-slate-800">
        Không có quyền truy cập!
      </h1>
      <h2 className="mb-10 mt-2 text-[4vmin] text-slate-500">
        Mã lỗi: 403 Forbidden
      </h2>
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-48 border-black text-lg font-medium"
        onClick={() => router.push("/")}
      >
        Về trang chủ
      </Button>
    </div>
  );
}
