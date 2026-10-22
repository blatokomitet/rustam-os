# Release checklist — Rustam OS demo

## Completed in source
- [x] Standalone React/Vite demo (no calls to Replit API).
- [x] Local-only task persistence and explicit demo labeling.
- [x] Responsive layout and PWA manifest.
- [x] CI: tests, TypeScript check, Vite production build.
- [x] Static SPA routing fallback.

## Must verify before public launch
- [ ] Connect Cloudflare Pages to GitHub and deploy a preview.
- [ ] Open preview on Android Chrome and desktop browsers.
- [ ] Check keyboard navigation, task CRUD, and persistence after reload.
- [ ] Check installability, offline shell and Lighthouse accessibility.
- [ ] Confirm no credentials, user data, or production API endpoints in build output.
- [ ] Confirm preview URL and publish only after successful smoke test.

## Migration guardrails
This demo is not the Replit production app. Never migrate real user records without verified PostgreSQL backup, export, reconciliation and rollback. D1/Workers backend remains future work.
