# RaceDay operations portal

Run `npm install` and `npm run dev`, then open [http://localhost:3001](http://localhost:3001).
Configure `BACKEND_API_URL` for the RaceDay API; the default is `http://localhost:5080`.

## Roles

| IAM role | Workspace | Functions |
| --- | --- | --- |
| Race-staff | `/race-staff` | Live map, scanner, manual entry, issues, race status, medical, cut-off, inventory, contingency, broom. |
| Admin | `/admin` | IAM users, audit logs. (Tài chính / hoàn lỗi HT → Manager) |
| Manager | `/manager` | Event approval/reject, payouts, system-error refunds, package durations/capacities, promos, reconciliation, stats. |
| Photographer | `/photographer` | Upload, OCR, corrections, analytics, publishing, photo requests. |

Navigation keeps short URLs such as `/users`, `/approvals`, and `/scanner`. The proxy selects the workspace from the backend-verified `raceday_ops_session` HttpOnly cookie. Legacy Coordinator/Volunteer bookmarks → Race-staff; old Admin event-ops bookmarks → Manager.

## API matrix (Admin vs Manager) — phải khớp BE

| Concern | Path | Policy |
| --- | --- | --- |
| Event duyệt / gói / promo | `/api/v1/event/manager/...` | **ManagerOnly** (Admin **không** gọi được) |
| Finance payout + hoàn lỗi HT | `/api/v1/finance/manager/...` | **ManagerOrAdmin** |
| IAM users | `/api/v1/iam/admin/users...` | **AdminOnly** |
| Map course (đọc khi duyệt) | `/api/v1/map/events/.../course` | Organizer / Admin / **Manager** / staff / public status |

FE clients: `src/api/admin-events.ts`, `admin-packages.ts` → manager event; `admin-finance.ts` → manager payouts/refunds; `admin-users.ts` → iam admin; `race-map.ts` → map.

Không còn `/api/v1/event/admin`. Bookmark FE cũ `/admin/approvals` redirect → `/approvals` (Manager).

## Validation

- `npm run build` — production + TypeScript
- `npm run test:auth` — session, role routing, Manager API path constants (offline)
- `npm run test:photo` — photo upload validation
- `node --test tests/race-map.test.mjs` — map helpers
- `npm run lint`

### Live UI (Playwright) — không chỉ unit test

Cần **API :5080** + **Admin FE :3001** + seed (`.\deploy\clear-and-seed.ps1` trong SEP_WebAPI).

```powershell
# Terminal 1 — API (Docker)
cd D:\SEP\SEP_WebAPI\deploy
docker compose --profile api up -d
.\clear-and-seed.ps1

# Terminal 2 — Admin FE
cd D:\SEP\SEP_FronteEnd_Admin\Com.FPTU.GFA26SE77.RaceDay.AdminWeb
npm run dev

# Terminal 3 — UI smoke
npx playwright install chromium   # lần đầu
npm run test:e2e                  # headless
npm run test:e2e:headed           # thấy browser
npm run test:e2e:ui               # Playwright UI mode
```

Seed accounts: `admin` / `manager` / password `MatKhau@123`.

Optional env:

| Env | Default |
| --- | --- |
| `E2E_ORIGIN` | `http://localhost:3001` |
| `E2E_BACKEND` | `http://localhost:5080` |
| `E2E_ADMIN_USER` | `admin` |
| `E2E_MANAGER_USER` | `manager` |
| `E2E_PASSWORD` | `MatKhau@123` |

Live BFF cookie suite (HTTP, không browser):

```powershell
$env:AUTH_TEST_ORIGIN='http://localhost:3001'
$env:AUTH_TEST_BACKEND='http://localhost:5080'
$env:AUTH_TEST_USERNAME='manager'
$env:AUTH_TEST_PASSWORD='MatKhau@123'
npm run test:live-auth
```
