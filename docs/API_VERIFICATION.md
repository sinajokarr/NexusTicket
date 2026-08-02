# API Verification

Verified on 2026-08-02 with Django 5.2.7, DRF 3.16.1, Python 3.13.7, SQLite test settings, and the repository test suite. `pytest` made authenticated and anonymous requests through Django/DRF; an isolated local server also verified health, schema, registration, login, authenticated order listing, event creation, reservation creation, payment initiation, and signed payment settlement. The project has no externally deployed API, so no third-party environment was contacted.

| Method | Endpoint | Auth | Scenario | Expected / actual result | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/health/` | No | Liveness probe | `200 {"status":"ok"}` | Pass |
| GET | `/api/schema/` | No | Schema discovery | `200` OpenAPI document | Pass |
| POST | `/api/auth/register/` | No | Strong password | `201`; weak password returns `400` | Pass |
| POST | `/api/auth/login/` | No | Registered user login | `200` with access and refresh tokens | Pass |
| POST | `/api/auth/refresh/` | No | Valid refresh token | `200` with a new access token | Pass |
| GET | `/api/events/categories/` | No | Public category list | `200` | Pass by route/configuration check |
| GET/POST | `/api/events/list/` | Read public / organizer write | Create, filter, and public visibility | Valid organizer create succeeds; unauthorized writes rejected | Pass |
| GET/PATCH | `/api/events/list/{slug}/` | Read public / owner write | Owner and non-owner mutation | Owner allowed; non-owner forbidden | Pass |
| GET/POST | `/api/events/tickets/` | Read public / organizer write | Direct ticket creation | Missing event rejected; non-owner forbidden; owner allowed | Pass |
| GET/POST | `/api/events/reviews/` | Read public / purchaser write | Review entitlement | Anonymous/non-purchaser rejected; paid customer flow tested | Pass |
| GET/POST | `/api/orders/` | Yes | Atomic multi-line reservation | `201`; capacity, totals, coupon count, and rows changed atomically | Pass |
| GET | `/api/orders/{id}/` | Yes, owner only | Ownership | Owner can read; other users cannot read it | Pass |
| POST | `/api/orders/{id}/cancel/` | Yes, owner only | Cancel pending reservation | `200`; inventory/coupon restored once; repeat rejected | Pass |
| POST | `/api/payments/request/` | Yes, owner only | Create demo payment | `201`/successful response with signed local payment URL; repeat request idempotency tested | Pass |
| GET/POST | `/api/payments/mock-bank/{authority_id}/` | Signed demo token | Payment page and settlement | Missing token denied; signed token settles once | Pass |
| POST | `/api/payments/verify/` | Owner or signed demo token | Forged completion attempt | Rejected; valid signed settlement accepted once | Pass |

## Contract notes

- Event list responses may be a raw array or a paginated `results` object; the frontend supports both.
- Event detail uses the event `slug`, not numeric ID.
- Orders accept `{ "items": [{ "ticket_class_id": 1, "quantity": 2 }] }`; legacy single-line input remains supported by the API.
- The client only redirects to HTTP(S) `payment_url` values returned by the API.
- API errors use DRF field/detail payloads. The client extracts the first actionable message and shows it in-page.

## Not verified against a live provider

No real payment processor, production MySQL deployment, mail provider, object storage, rate-limit service, or external identity provider exists in this repository. Those integrations are therefore intentionally not marked as tested.
