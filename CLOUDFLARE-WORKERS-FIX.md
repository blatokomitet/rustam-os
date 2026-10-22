# Blank screen troubleshooting — Cloudflare Workers

This project is a static Vite application. Deploy **compiled `dist/` assets**, never `src/` or repository root.

## Workers Builds settings

- Git repository: `blatokomitet/rustam-os`
- Production branch: `main`
- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Wrangler config: `wrangler.jsonc`

The `wrangler.jsonc` file tells Workers to serve static assets from `dist` and to fall back to `index.html` for SPA routes.

## Browser diagnostics

1. Open DevTools → Network → reload with cache disabled.
2. `/` must return HTML containing `/assets/index-....js`.
3. The JS/CSS requests under `/assets/` must return HTTP 200 and the correct JavaScript/CSS MIME type, not HTML.
4. Open Console for errors. If `Unexpected token '<'` or MIME-type errors appear, static assets were not deployed correctly.
5. After successful redeployment, clear the site data or unregister the old service worker if it cached an outdated page.

Do not add production secrets or personal data to this demo.
