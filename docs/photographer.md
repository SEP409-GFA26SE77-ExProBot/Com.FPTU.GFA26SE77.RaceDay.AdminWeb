# Photographer photo workflows

Implements the photographer endpoints introduced by WebAPI commit `96270bf` (`Feat: Photo module content`). Requests use the existing HttpOnly session BFF; credentials and service keys are not stored in browser state.

## API coverage

Paths below are relative to `/api/v1/photo/photographer/events/{eventId}`.

| Method | Path | UI |
| --- | --- | --- |
| POST | `/photos/bulk-upload` | Upload JPG/PNG/WebP files with an optional zone |
| GET | `/photos/pending` | Upload screen and OCR queue, polling every five seconds |
| GET | `/photos/matched` | OCR results and searchable gallery |
| GET | `/photos/review` | BIB corrections and OCR review results |
| POST | `/photos/process` | Start OCR or retry failed photos |
| PATCH | `/photos/{photoId}` | Save a corrected BIB |
| GET | `/disputes` | Open photo disputes |
| POST | `/disputes/{id}/approve` | Approve a dispute and move the photo to review |
| POST | `/disputes/{id}/reject` | Reject a dispute with a required reason |

Supporting endpoints: `GET /api/v1/event/staff/me`, `GET /api/v1/photo/photos/{photoId}`, and `GET /api/v1/photo/photos?eventId=&bib=&page=&pageSize=`.

Only active photographer assignments appear in the event picker. The backend independently checks the event assignment on each photographer request. Lists use server pagination. Responses from a previous event or page are discarded. Loading, empty, error, progress and mutation states are displayed.

Bulk selections are checked in full before upload: up to 500 files, each nonempty and at most 25 MiB. Requests are batched with at most 25 MiB of file data, leaving room for multipart headers below the API's default body limit. A failed batch retains the remaining selection and reports completed/duplicate counts; retry relies on backend duplicate detection. The zone is limited to the persisted 64 characters.

Matched and manually corrected photos are automatically searchable. There is no publish action in this backend version. The former mock publishing screen now shows the live gallery and BIB search; analytics show actual status-group totals. Internal OCR callbacks and runner-only dispute management are not exposed as photographer controls.

## Validation on 23 October 2026

- Logged into the running admin app on port 3001 with the supplied photographer account and its existing assignment.
- Uploaded three synthetic PNG fixtures through the browser; confirmed pending records and image previews.
- Uploaded a duplicate; confirmed zero accepted and one skipped.
- Verified unsupported and empty files are rejected before upload.
- Queued three photos through the browser; a repeat process request queued zero.
- Corrected a review BIB and verified normalized, persisted manual tags.
- Viewed a disputed photo, approved one dispute, rejected another with a reason, then corrected the approved photo.
- Verified matched/review/pending lists, BIB search, empty search, automatic visibility and real analytics counts.
- Verified anonymous requests are rejected and unassigned event access is denied by the backend.
- Frontend production build, TypeScript and lint for all changed feature files passed.
- Four upload validation/batching tests passed (`npm run test:photo`).
- Existing authentication suite: 20 passed; the optional signed-expired-token case was skipped without its signing-key test variable.
- All 12 existing Photo unit tests and three new PostgreSQL persistence regression cases passed.

The local OCR service URL/key are not configured. Actual image recognition was therefore not exercised. After verifying queuing, only the three labelled synthetic uploads were assigned OCR-result fixture states in the local database to exercise review and dispute transitions. They remain in the assigned event under zone `E2E test - synthetic fixtures` (BIBs `E2E1001` and `E2E1002`). No existing photos were changed.

## Backend fix found during testing

Replacing OCR tags during manual correction or OCR-result application caused EF to issue an UPDATE for a newly generated tag ID, producing `DbUpdateConcurrencyException`. `PhotoAssetRepository.Update` now explicitly adds untracked replacement tags. PostgreSQL regression tests reproduce the failure before the fix and verify manual correction, OCR matched results and OCR review results after it, including removal of old tags.

The regression project is `tests/RaceDay.Modules.Photo.IntegrationTests` in WebAPI. Set `PHOTO_TEST_CONNECTION_STRING` to a local database with the Photo migration applied, then run:

```powershell
dotnet test tests/RaceDay.Modules.Photo.IntegrationTests/RaceDay.Modules.Photo.IntegrationTests.csproj
```

Each case rolls back its database transaction. Without the connection variable, these integration tests are explicitly skipped. The existing backend EF version-conflict and dependency-audit warnings remain.
