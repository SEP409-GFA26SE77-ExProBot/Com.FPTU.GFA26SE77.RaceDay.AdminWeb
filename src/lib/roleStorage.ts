export const ROLE_STORAGE_KEY = "raceday_role";

/**
 * Stores the chosen role in both localStorage and document.cookie.
 */
export function setStoredRole(roleId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, roleId);
    // 30 days expiry cookie
    document.cookie = `${ROLE_STORAGE_KEY}=${encodeURIComponent(roleId)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to store role in storage/cookie:", err);
  }
}

/**
 * Retrieves the stored role from localStorage or document.cookie.
 */
export function getStoredRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(ROLE_STORAGE_KEY);
    if (fromLocal) return fromLocal;

    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ROLE_STORAGE_KEY}=`));
    if (cookieMatch) {
      return decodeURIComponent(cookieMatch.split("=")[1]);
    }
  } catch (err) {
    console.error("Failed to read role from storage/cookie:", err);
  }
  return null;
}
