# Portfolio Readiness Audit

## Executive summary

NexusTicket is a credible full-stack portfolio project after the remediations in this audit. Its strongest evidence is the inventory-safe Django order flow, JWT API tests, a successful React production build, and documented Docker development setup. It is **ready for GitHub with minor limitations**, not ready for real-money production use.

## Repository state and architecture

- Branch created for this audit: `audit/portfolio-readiness` (not pushed).
- Existing modified Python bytecode files were preserved; they were not overwritten.
- Architecture: Django 5.2 / DRF / Simple JWT / Celery / Redis / SQLite local default or MySQL Docker; React 19 / Vite / TypeScript frontend; npm and pip package managers.
- Entry points: `manage.py`, `config/asgi.py`, `config/wsgi.py`, `frontend/src/main.tsx`.
- No prior GitHub Actions workflow existed.

## Baseline and final verification

| Area | Status | Evidence | Remaining issue |
| --- | --- | --- | --- |
| Backend checks | PASS | `python3 manage.py check` | None found. |
| Migration drift | PASS | `python3 manage.py makemigrations --check --dry-run` | None found. |
| Backend tests | PASS | `21 passed, 2 subtests passed` | No coverage threshold or browser E2E suite. |
| Frontend lint/type check | PASS | `npm run lint` | ESLint is not configured; script is TypeScript-only. |
| Production build | PASS | `npm run build` | Single JS bundle is about 395 kB uncompressed. |
| Frontend dependency scan | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities | Backend dependency vulnerability scan tool not installed. |
| Python dependencies | PASS | `python3 -m pip check` | Requirements are range-based, no lock file. |
| Docker compose syntax | PASS | `docker compose config --quiet` | Containers were not launched in the audit environment. |
| Responsive browser test | BLOCKED | In-app browser unavailable | Manual viewport matrix still required. |

## Confirmed findings

### P0 — remediated

1. A real `.env` was tracked in Git, including secret-bearing configuration. The file has been removed from the Git index while remaining on disk, and `.env.example` is safe. The local database and tracked Python bytecode were also removed from the index. **Rotate any secret that was ever committed; this change does not erase Git history.**

### P1 — remediated

1. README commands, Docker container name, and port claims were stale or inaccurate. Documentation now uses `docker compose exec web` and port `8011` by default.
2. Production mode allowed a known development fallback secret. It now fails configuration when `DEBUG=False` and that fallback remains in use.
3. No health endpoint or CI quality gate existed. `/health/` and a two-job GitHub Actions workflow are now present.

### P2 — remaining

1. Live API data has no localization schema; only the frontend’s source copy and fictional inventory are four-language capable.
2. JWTs are stored in local storage. This is common for demos but is a higher XSS exposure than a carefully designed httpOnly-cookie model.
3. The demo payment flow is deliberately simulated. It has robust signed-token tests but is not a real gateway.
4. The Docker stack is development-oriented (`runserver`); production static/media handling, reverse proxy, observability, CSP, and rate limiting are absent.
5. Dialogs/drawers are not focus-trapped, and no automated browser accessibility tests exist.

### P3 — remaining

1. The client build is a single ~395 kB JavaScript bundle before gzip; route-level code splitting could improve initial load.
2. SEO lacks sitemap, canonical URL, web manifest, and per-route metadata.
3. No license has been selected; ownership/reuse intent needs an owner decision.

## Changes applied

- Hardened production Django settings and added explicit CSRF trusted-origin support.
- Added a lightweight health endpoint.
- Expanded `.gitignore` and `.env.example` without exposing values.
- Replaced unsupported README claims with tested commands and clear demo limitations.
- Added GitHub Actions quality checks.
- Added architecture, API verification, portfolio checklist, and this report.

## Security and performance notes

Order creation, cancellation, expiry, coupon consumption, and demo settlement use atomic operations and object ownership checks. The API does not enable wildcard CORS. The remaining public-history secret risk must be handled through rotation and, if necessary, history rewriting before publication. The frontend audit found no high-severity production dependency vulnerability. No production performance benchmark was run.

`npm audit` emitted a host-environment warning that `NODE_TLS_REJECT_UNAUTHORIZED=0` was set while the audit command ran. That setting was not found in this repository; ensure it is unset in local and CI environments because it disables HTTPS certificate validation.

## Score

Estimated baseline: **61/100**. Final verified score: **76/100**.

| Category | Score | Reason |
| --- | ---: | --- |
| Functionality | 16/20 | Main ticket and demo-payment flows exist; some storefront features are demo-local. |
| API/backend reliability | 13/15 | Strong transaction and authorization tests; no production load test. |
| Security | 10/15 | Secret indexing issue remediated, production guard added; local-storage JWT/rate limiting/CSP remain. |
| Code quality | 12/15 | Clear separation and tests; inconsistent formatting and no backend lint gate. |
| UI/UX/responsive | 7/10 | Polished source and breakpoints, but browser matrix was blocked. |
| Testing | 8/10 | High-value API tests pass; no frontend unit/E2E coverage. |
| Performance | 3/5 | Good Vite output but no split routes or measurements. |
| Accessibility | 3/5 | Solid baseline semantics; focus traps unverified. |
| Documentation/GitHub | 4/5 | Accurate docs, safety cleanup, and CI; no license decision. |

Strongest aspects: transaction-safe inventory, practical API test coverage, and a polished multilingual frontend foundation. Most important remaining weaknesses: real production payment/deployment readiness, API-backed translations, and browser/E2E accessibility verification.
