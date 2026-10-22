import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
test('demo has standalone frontend entrypoint',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/src\/main.tsx/);});
test('no Replit API endpoint or credentials in demo code',()=>{const source=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/fetch\s*\(|replit\.app|CLERK_SECRET_KEY|DATABASE_URL/);});
test('Cloudflare-compatible build output configured',()=>{const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));assert.equal(pkg.scripts.build,'vite build');});
