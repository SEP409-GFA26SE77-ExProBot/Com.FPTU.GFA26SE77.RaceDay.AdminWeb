export type SimulationPhase = "Ready" | "Running" | "Paused" | "Finished";
export type AthleteMotion = "Racing" | "Finished" | "Dnf" | "Dns" | "Dq";
export type SimulationLatLng = { lat: number; lng: number };
export type SimulationCheckpointDto = {
  id: string; name: string; km: number; lat: number; lng: number; type: string;
};
export type SimulationDecisionDto = {
  id: string; registrationId: string; bib: string; previousStatus: string; status: string;
  reason: string; evidence: string | null; actorId: string; checkpointId: string; createdAtUtc: string;
  resolution: "Pending" | "Approved" | "Rejected"; reviewedBy: string | null;
  reviewedAtUtc: string | null; reviewReason: string | null;
  createdAtSimSeconds?: number | null; reviewedAtSimSeconds?: number | null;
};

export function simulationHubUrl(): string {
  const origin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080").replace(/\/$/, "");
  return `${origin}/api/v1/simulation/hub`;
}

export async function fetchHubAccessToken(): Promise<string> {
  const res = await fetch("/api/auth/hub-token", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Không lấy được token cho SignalR (đăng nhập lại).");
  const body = (await res.json()) as { accessToken?: string };
  if (!body.accessToken) throw new Error("Token hub trống.");
  return body.accessToken;
}

export function formatSimClock(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return [h, m, r].map(n => String(n).padStart(2, "0")).join(":");
}

function haversineKm(a: SimulationLatLng, b: SimulationLatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function positionAtCourseKm(poly: SimulationLatLng[], courseKm: number): SimulationLatLng {
  if (poly.length === 0) return { lat: 0, lng: 0 };
  if (courseKm <= 0) return poly[0];
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + haversineKm(poly[i - 1], poly[i]));
  const target = Math.min(courseKm, cum[cum.length - 1] || 0);
  for (let i = 1; i < cum.length; i++) {
    if (target <= cum[i]) {
      const seg = cum[i] - cum[i - 1] || 1;
      const f = (target - cum[i - 1]) / seg;
      return {
        lat: poly[i - 1].lat + (poly[i].lat - poly[i - 1].lat) * f,
        lng: poly[i - 1].lng + (poly[i].lng - poly[i - 1].lng) * f,
      };
    }
  }
  return poly[poly.length - 1];
}

export function checkpointMapColor(type: string): string {
  switch (type) {
    case "finish": return "#b91c1c";
    case "start": return "#0f766e";
    case "aid": return "#a16207";
    default: return "#c2410c";
  }
}
