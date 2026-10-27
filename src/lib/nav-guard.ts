/** Optional SPA nav blocker (e.g. bulk upload in progress). */
let blocker: (() => string | null) | null = null;

export function setNavBlocker(fn: (() => string | null) | null) {
  blocker = fn;
}

export function getNavBlockMessage(): string | null {
  try {
    return blocker?.() ?? null;
  } catch {
    return null;
  }
}
