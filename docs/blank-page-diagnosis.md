# Blank Page Diagnosis (TopMox Global Tutoring)

## Current Verdict

The public homepage is not blank from source code. A clean dev run on port `7000` returns real HTML and valid static assets.

Latest runtime check:

| Check | Result |
|---|---|
| `npm run dev:clean` | Pass |
| `npm run verify:homepage` | Pass |
| Homepage status | `200` |
| Homepage HTML length | `120068` |
| Homepage contains `TopMox` | Yes |
| Static assets checked | 3 assets, all OK |
| Missing `.next` chunk errors | Not found |
| Manifest JSON parse errors | Not found |
| NextAuth env warnings | Not found |
| Prisma generated-client runtime errors | Not found |

## Root Causes Found

### 1) Stale or corrupted `.next` artifacts

Earlier failures showed generated Next.js artifact errors:

- `Cannot find module './276.js'`
- `Cannot find module './682.js'`
- require stack involving `.next/server/webpack-runtime.js`
- `/_next/static/...` returning `404`
- `Unexpected end of JSON input` while loading a manifest

Those errors are generated-cache failures, not homepage source failures.

Recovery:

```bash
npm run clean:next
npm run dev:clean
```

Then open:

```txt
http://localhost:7000
```

### 2) Port mismatch after moving from 4000 to 7000

The active dev port is now `7000`.

Use:

```bash
npm run dev:clean
```

Expected URL:

```txt
http://localhost:7000
```

If a browser tab is still pointed at `4000`, it is looking at the old port.

### 3) Invalid `next.config.mjs` option

`next.config.mjs` previously included an unsupported `onError` key. Next.js 14 warned:

```txt
Invalid next.config.mjs options detected
Unrecognized key(s) in object: 'onError'
```

That key has been removed. Client-side logging now lives in `src/app/ClientLayout.tsx` and `src/lib/utils/logger.ts`.

### 4) Health route was being prerendered and touching Prisma at build time

`/api/health` previously tried to instantiate Prisma during build prerendering. That caused:

```txt
@prisma/client did not initialize yet. Please run "prisma generate"
```

The route is now marked dynamic:

```ts
export const dynamic = "force-dynamic";
```

So health checks run at request time, not during static generation.

## Verification Commands

Latest successful commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run dev:clean
npm run verify:homepage
```

## Remaining External Issue

`prisma generate` can still fail in this environment with:

```txt
getaddrinfo EAI_AGAIN binaries.prisma.sh
```

That means the environment cannot resolve or reach Prisma's binary download host. If lint, typecheck, tests, build, and homepage verification pass, this specific error should not be treated as the blank-page cause.

