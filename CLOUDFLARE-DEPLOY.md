# Rustam OS — independent Cloudflare demo

This is a **new standalone demonstration**, not a migration of the Replit application. It does not connect to Clerk, PostgreSQL, Java or Replit. No private data is copied.

## Local development

- Node.js 22+
- `npm install`
- `npm run dev`
- `npx tsc --noEmit && npm run build`

## Cloudflare Workers / static assets

Connect this GitHub repository to Cloudflare Workers Builds or Pages.
For **Cloudflare Pages**: framework preset Vite, build command `npm run build`, output directory `dist`, root directory `/`. The included `public/_redirects` supports client-side routes if added later.

Do **not** configure production API secrets for this demo. It uses only browser-local storage for sample tasks. It is not synchronized across devices. Other sections show clearly marked example or placeholder data.

Before connecting Cloudflare, merge the reviewed branch or configure a preview build from `feature/cloudflare-demo`. Publishing is not performed by this PR.

## Future production migration

1. Export and back up PostgreSQL with verified restoration.
2. Specify Java business rules (XP, tenancy, transactions) as contract tests.
3. Implement a separate Workers API and D1 schema; do not point demo to private production DB.
4. Verify auth and owner isolation before real user data.
5. Run migrations on staging and validate data parity before cutover.
