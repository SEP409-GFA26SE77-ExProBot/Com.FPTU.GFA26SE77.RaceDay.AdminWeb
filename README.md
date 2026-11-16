# RaceDay operations portal

Run `npm install` and `npm run dev`, then open [http://localhost:3001](http://localhost:3001).
Configure `BACKEND_API_URL` for the RaceDay API; the default is `http://localhost:5080`.

Development uses Webpack (`next dev --webpack`) to avoid the Turbopack Google Fonts resolver error `next/font/google queries have exactly one entry`. After updating the dev script, stop the running dev server and run `npm run dev` again. See [Next.js CLI options](https://nextjs.org/docs/app/api-reference/cli/next#next-dev-options).

Dashboard Admin tại trang chủ: [luồng giao diện, API và cách kiểm tra](docs/dashboard.md).

## Roles

| IAM role | Workspace | Functions |
| --- | --- | --- |
| Race-staff | `/race-staff` | Assigned checkpoint simulation (live map, checkpoint history, DNF/DNS/DQ reports, export to organizer), live map, scanner, manual entry, issues, race status, medical, cut-off, inventory, contingency, broom. |
| Admin | `/admin` | Account dashboard, IAM users, audit logs. (Tài chính / hoàn lỗi HT → Manager) |
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

## Race-staff checkpoint simulation

Race-staff lands on `/checkpoint` after login, selects an assigned event, and follows the organizer simulation at `/checkpoint/events/{eventId}`. The existing live map remains available at `/map`.

The screen has Athletes, Checkpoint activity, and Staff journal tabs. It defaults to the assigned segment, shows pending DQ reports, and keeps draft form input during a temporary connection loss while disabling writes. Assignment revocation clears private data. Staff must have an active checkpoint assignment on the event map.

Business journal entries persist after reset/API restart and can be filtered by run, action, runner, and actor (25 per page). Old runs are read-only; simulation state itself is not restored. DNS/DNF, DQ reporting/review, and checkpoint submission are recorded with actor identity and real/simulated timestamps. Automatic passages remain current-run activity.

Staff own `(previous checkpoint km, assigned checkpoint km]`; Start owns the starting position. For CP1 at km 3 and CP2 at km 5, CP2 owns `(3, 5]`. DNF requires a Racing runner currently in that segment (Running/Paused). DQ reporting also remains available after a recorded passage at the assigned checkpoint in the current run, including after Finish, until sealing/run locking/reset. Report only incidents in your assigned segment/station. Use **Đã qua** or **Tất cả VĐV** to find runners who have passed. The FE uses backend `isInAssignedSegment` and action flags; it does not calculate boundaries. Deploy this scope change with its matching backend; no new migration is required.

Test with `coord2` at CP 1.25 km: start a run, open DNF while the runner approaches, then let the runner pass; the form retains its reason and disables submission. Find the runner under **Đã qua**, report DQ, have the organizer review it, then submit the checkpoint report after Finished. The journal retains the reporting checkpoint and timestamps after reset.

Submit checkpoint results only after the run finishes and all local DQ reports are resolved. Submission seals that checkpoint for both staff and organizer; retry returns the existing report. The report is a snapshot and does not publish official results. Deploy the backend migration `20261116010000_AddSimulationJournal` before this AdminWeb version.

Start the WebAPI on port 5080. REST calls use `BACKEND_API_URL`; the browser SignalR connection uses `NEXT_PUBLIC_API_URL` (default `http://localhost:5080`) and connects to `/api/v1/simulation/hub`. Set both URLs to the API origin when using a different backend address.

## Validation

- `npm run build` — production + TypeScript
- `npm run test:auth` — session, role routing, Manager API path constants (offline)
- `npm run test:photo` — photo upload validation
- `node --test tests/race-map.test.mjs tests/staff-checkpoint.test.mjs` — map helpers, checkpoint counts/filters and access-loss classification
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

### Staff checkpoint workflow test

Run against an isolated API database containing the `seed-staff-workspace.ps1` fixtures. The test creates/resets simulation drafts and submits a checkpoint report; use a database copy rather than shared demo state. Configure the FE `BACKEND_API_URL` and `NEXT_PUBLIC_API_URL` to the same API as `E2E_BACKEND`.

```powershell
$env:STAFF_CHECKPOINT_E2E='1'
$env:E2E_BACKEND='http://localhost:5080'
npx playwright test e2e/staff-checkpoint.spec.ts
```

Defaults: `coord1` (Start), organizer `cuong.le`, seeded 5K event/distance. Override with `E2E_STAFF_USER`, `E2E_ORGANIZER_USER`, `E2E_STAFF_EVENT`, `E2E_STAFF_DISTANCE`, and `E2E_PASSWORD`. `E2E_BROWSER_PATH` optionally selects an installed Chromium browser. Coverage includes offline draft preservation, realtime decisions, DQ resolution, sealing, and prior-run history after reset.

After the workflow passes, restart that isolated API, set `STAFF_CHECKPOINT_RESTART_E2E=1`, and rerun the same command to verify history after restart and data clearing on revocation. This second scenario removes the test staff assignment from the isolated database; discard the database copy afterward.
