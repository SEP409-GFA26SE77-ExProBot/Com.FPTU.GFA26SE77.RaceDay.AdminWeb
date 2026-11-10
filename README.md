# RaceDay operations portal

Run `npm install` and `npm run dev`, then open [http://localhost:3001](http://localhost:3001).
Configure `BACKEND_API_URL` for the RaceDay API; the default is `http://localhost:5080`.

## Roles

| IAM role | Workspace | Functions |
| --- | --- | --- |
| Race-staff | `/race-staff` | All former Coordinator and Volunteer tools: live map, scanner, manual entry, issues, race status, medical, cut-off, inventory, contingency, and broom vehicle. |
| Admin | `/admin` | IAM accounts, platform finance, payouts, fee settings, and audit logs. |
| Manager | `/manager` | Event approval and rejection, package durations and capacities, promos, reconciliation, and statistics. |
| Photographer | `/photographer` | Existing upload, OCR, corrections, analytics, publishing, and photo request workflows. |

Navigation keeps short URLs such as `/users`, `/approvals`, and `/scanner`. The proxy selects the workspace from the backend-verified `raceday_ops_session` HttpOnly cookie. Direct URLs are checked against the same permissions as navigation. Existing Coordinator and Volunteer bookmarks resolve to Race-staff; old Admin event-operation bookmarks resolve to Manager.

IAM `Race-staff` and event assignment `race-staff` normalize to the internal `RACE_STAFF` role. Map and scanner select only active Race-staff assignments. Photographer assignments remain separate. Retired Coordinator and Volunteer IAM roles require the backend role migration and a fresh login.

## API compatibility

Manager continues to use the existing `/api/v1/event/admin/...` endpoints for approvals, promos, package durations, and package capacities. These URLs keep their names and require the Manager role. Admin retains `/api/v1/iam/admin/users...`, `/api/v1/finance/admin...`, and the existing audit-log endpoint.

## Validation

- `npm run build` builds the production app and checks TypeScript.
- `npm run test:auth` checks session handling, role routing, assignment filtering, menu permissions, legacy bookmarks, and Manager API compatibility.
- `npm run test:photo` checks photo upload validation and batching.
- `node --test tests/race-map.test.mjs` checks map API and geometry handling.
- `npm run lint` runs the repository ESLint checks.

The live authentication suite requires `AUTH_TEST_ORIGIN`, `AUTH_TEST_USERNAME`, and `AUTH_TEST_PASSWORD`; it skips when these are absent.
