/** Base URL BE RaceDay (cùng User FE: NEXT_PUBLIC_API_URL). */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5080";
