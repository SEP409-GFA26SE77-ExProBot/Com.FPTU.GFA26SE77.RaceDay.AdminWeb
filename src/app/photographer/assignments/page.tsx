"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Phân công giải đã bỏ — account gắn theo event như volunteer. */
export default function PhotographerAssignmentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/upload");
  }, [router]);
  return null;
}
