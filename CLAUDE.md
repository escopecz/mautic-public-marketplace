AI Notes (Claude)

This repo is a Symfony app for the public Mautic Marketplace.
- Use Supabase middleware API for data (read + write).
- Auth0 required for authenticated reviews.
- Carbon Design System for UI; Twig templates; minimal JS.
- DDEV local dev must include a Supabase local stack.
- Production Docker is single container, no workers.
- Enforce quality via PHP CS Fixer (Symfony), PHPStan, Rector, and functional tests.
