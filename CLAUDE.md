@AGENTS.md

# RaceDay admin-fe — Claude Code notes

Ops web app for the staff roles in `src/lib/route-permissions.ts` (ADMIN, MANAGER, RACE_STAFF, PHOTOGRAPHER). The browser never calls the API directly:

- `src/app/api/backend/[...path]/route.ts` proxies to the RaceDay WebAPI and adds `Authorization: Bearer` from the HttpOnly `raceday_ops_session` cookie.
- `src/proxy.ts` checks the user with `/api/v1/iam/me` and rewrites short URLs (e.g. `/emergency`) to the role folder (`/admin/emergency`, `/race-staff/emergency`).
- Navigation lives in `src/config/ops-nav.ts`; sidebar icons in `src/components/sections/Sidebar.tsx`.

## Commands

```bash
npm run dev          # http://localhost:3001 (webpack)
npm run build        # production build
npm run lint
npx tsc --noEmit
npm run test:auth    # auth store/http + tests/role-access.test.mjs — run after changing route-permissions or ops-nav
npm run test:e2e     # Playwright, e2e/*.spec.ts
```

The dev server's backend is whatever `BACKEND_API_URL` / `NEXT_PUBLIC_API_URL` point to (usually the Docker API on `http://localhost:5080`). New backend endpoints return 404 there until that API image is rebuilt.

## Emergency page and cut-off alerts (added 2026-11-23)

Admin and Race-staff see runners who did not pass a checkpoint before its cut-off, and get a toast when a new one is detected. Detection runs on the server (see the WebAPI `CLAUDE.md`); this app only lists and displays.

| Piece | File |
| --- | --- |
| Page (shared by both roles) | `src/components/emergency/EmergencyWarningsPage.tsx`, routes `src/app/admin/emergency/page.tsx`, `src/app/race-staff/emergency/page.tsx` |
| Old Medical URL | `src/app/race-staff/medical/page.tsx` redirects to `/emergency` (Medical was renamed to Emergency) |
| Live listener + toast | `src/components/emergency/CutoffWarningListener.tsx`, mounted in `src/components/RoleWorkspace.tsx` for ADMIN and RACE_STAFF only |
| Shared live state | `src/stores/cutoff-warning-store.ts` (Zustand: `connected`, `version`, `freshIds`) |
| API calls and types | `src/api/cutoff-warnings.ts` (list, passages, dismiss, stream URL) |
| Time formatting | `src/components/emergency/format.ts` (`vi-VN`, 24h, "x phút trước") |
| Nav | `ops-nav.ts` item `emergency`, label "Khẩn cấp"; `route-permissions.ts` allows `emergency` for ADMIN and RACE_STAFF |

### How live updates work (SSE, not WebSocket)

- One `EventSource` per tab, opened by `CutoffWarningListener` on any Admin/Race-staff page, to `/api/backend/api/v1/race-monitoring/cutoff-warnings/stream`. `EventSource` cannot send headers, so it must go through the proxy, which adds the token from the cookie.
- Server events: `ready` (mark connected, refetch to catch up), `heartbeat` every 15 s (ignored), `CutoffWarningRaised` (toast + refresh), `CutoffWarningResolved` / `CutoffWarningDismissed` (refresh only). The proxy sends `unavailable` with `retry: 3000` when the backend is down.
- The browser reconnects by itself; on an HTTP error (`readyState === CLOSED`) the listener retries after 15 s. The server closes the stream when the JWT expires and the client reconnects with the fresh cookie.
- The Emergency page does **not** open its own stream. It refetches when the store's `version` changes and marks rows in `freshIds` as "Mới".
- The proxy treats only paths matching its long-lived-stream regex (`isPositionStream` in `route.ts`) as SSE: no 60 s timeout, `X-Accel-Buffering: no`. A new SSE endpoint must be added to that regex or it will be cut off after 60 s.

### Toasts

- Use `toastWarn` / the helpers in `src/lib/toast.ts`; the only `ToastContainer` is in `src/components/providers/ToastProvider.tsx` (root layout). Do not add another container.
- The cut-off toast uses `toastId: cutoff:{warningId}` so a warning is toasted once, `autoClose: 15_000`, and clicking it opens `/emergency`.

### UI rules for this page

- All user-facing text is Vietnamese with full diacritics (root element has `lang="vi"`). Terms in use: "Khẩn cấp", "Cảnh báo" / "Đã tự đóng" / "Đã gỡ", "VĐV", "BIB", "checkpoint", "cut-off", "Gỡ khỏi danh sách cảnh báo".
- Vietnamese labels are long. The table has `min-w-[900px]`; long headers wrap (`whitespace-normal`), "Giờ cut-off" stays on one line; row action buttons show icon only below `2xl` (with `title` and `aria-label`), text from `2xl`. The filter bar goes to one row at `xl`.
- After layout changes, check 1280, 1440 and 1920 px (the Remove button must stay visible without scrolling the table) and ~390 px (only the table scrolls sideways, never the page).
- "Gỡ" (dismiss) only changes the warning's status; it never deletes registrations, scans or history.

### Testing the toast without the real backend

A stand-in backend that serves `/api/v1/iam/me` and the cut-off endpoints (SSE frames as `event: X\ndata: {json}\n\n`) plus Playwright against `npm run build && next start` was used to verify: toast appears on another page, click opens `/emergency`, live row, one toast per warning, passages dialog, dismiss, no console errors. These scripts are not in the repo; add them under `e2e/` if this needs to run in CI.
