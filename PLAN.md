Mautic Marketplace (Public) - Delivery Plan

Goals
- Public Symfony app that lists packages via Supabase middleware API with search/filter/sort and detail pages.
- Auth0 login from day one to enable rating/review write operations.
- Carbon Design System UI, mostly vanilla JS.
- DDEV local dev with Supabase container(s); production single-container Docker image.
- Quality tooling (CS Fixer, PHPStan, Rector) + functional tests.

Scope
- Read: package listing, search, filters, sorting, details, review list, ratings.
- Write: authenticated review submission (rating + comment).
- No background workers; Supabase handles DB and related jobs.

Reference Links (Provided)
- Existing marketplace UI in Mautic admin: https://github.com/mautic/mautic/tree/7.x/app/bundles/MarketplaceBundle
- Supabase middleware integration PR: https://github.com/mautic/mautic/pull/15500
- Supabase project (API + DB layer): https://github.com/mautic/mautic-marketplace
- Auth0 domain fix approach: https://github.com/mautic/marketplace-frontend

Phase 1 - Foundation
- Create Symfony latest app, confirm PHP version and Composer constraints.
- Add DDEV config; include Supabase local stack as DDEV service(s).
- Add production Dockerfile (single container) and docker-compose for deployment.
- Add baseline env var schema and README for setup.

Phase 2 - Supabase API (Read)
- Build API client for Supabase middleware endpoints.
- Define DTOs and response mapping with pagination, sorting, and errors.
- Add caching strategy (short TTL or ETag).
- Fix local seeding to run `fetch_package` once the upstream Deno dependency resolves (esm.sh 500 during setup).

Phase 3 - UI (Read)
- Build routes/controllers and Twig templates for listing and detail pages.
- Implement Carbon Design System styles and components.
- Add progressive enhancement for filters/search using vanilla JS.

Phase 4 - Auth0 + Reviews (Write)
- Implement Auth0 login/logout and session handling.
- Add review submission form with CSRF + validation.
- Wire write requests to Supabase with user identity info.

Phase 5 - Quality + Tests
- Configure PHP CS Fixer (Symfony rules), PHPStan, Rector.
- Functional tests for listing, detail, auth flow, review submission.
- Add CI checks to enforce quality gates.

Phase 6 - Polish + Docs
- Add error handling pages and logging.
- Document local dev (DDEV + Supabase), env vars, Auth0 setup.
- Smoke test with live Supabase project.

Deliverables
- Symfony app with full read/write marketplace functionality.
- Local and production containerization.
- Automated quality checks and functional test coverage.

Milestones
- M1: Foundation and local dev working (DDEV + Supabase).
- M2: Read-only marketplace UI live.
- M3: Authenticated review submission live.
- M4: CI quality gates green with functional tests.

Risks / Assumptions
- Supabase API stability and schema alignment.
- Auth0 domain restrictions addressed via marketplace-frontend approach.
- Carbon Design System integration in Symfony/Twig.
