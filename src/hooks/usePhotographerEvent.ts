"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listMyStaffAssignments,
  type StaffAssignmentDto,
} from "@/api/check-in";
import { getApiErrorMessage } from "@/lib/error";

function isPhotographer(a: StaffAssignmentDto) {
  return (a.role || "").toLowerCase() === "photographer";
}

function isActive(a: StaffAssignmentDto) {
  return (a.status || "").toLowerCase() === "active";
}

/**
 * Giống volunteer: account đã được Organizer gán theo giải.
 * Ưu tiên assignment Photographer Active; fallback photographer bất kỳ.
 */
export function usePhotographerEvent() {
  const [assignment, setAssignment] = useState<StaffAssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listMyStaffAssignments();
      const pho = items.filter(isPhotographer);
      const pick =
        pho.find(isActive) ?? pho[0] ?? items.find(isActive) ?? items[0] ?? null;
      setAssignment(pick);
      if (!pick) {
        setError("Chưa được phân công Photographer cho giải nào.");
      }
    } catch (e) {
      setAssignment(null);
      setError(getApiErrorMessage(e, "Không tải được phân công giải."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    assignment,
    eventId: assignment?.eventId ?? "",
    eventName: assignment?.eventName ?? "",
    loading,
    error,
    reload,
  };
}
