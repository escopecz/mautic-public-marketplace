AI Notes (Codex)

Project goals
- Public Symfony marketplace app backed by Supabase middleware API.
- Auth0 login required for review submission.
- Carbon Design System UI; Twig templates; mostly vanilla JS.
- DDEV local dev with Supabase services; production single-container Docker.
- Quality gates: PHP CS Fixer (Symfony), PHPStan, Rector, functional tests.

Implementation guidance
- Keep changes small and well-scoped.
- Prefer DTOs and typed responses for API integration.
- Add CSRF and validation to any write operations.
