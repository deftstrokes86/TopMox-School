# Local Development Setup

This checklist is for a fresh clone of the TopMox School Next.js repo.

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variables

1. Copy `.env.example` to `.env.local`.
2. Fill these required values in `.env.local`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL=http://localhost:4000`
   - `NEXTAUTH_SECRET` (secure random string)
   - `NEXT_PUBLIC_DEMO_LOGIN_ENABLED=true` (or `false`)

Generate a local secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3) Generate Prisma client

```bash
npm run prisma:generate
```

## 4) Validate project health

```bash
npm run typecheck
npm run test
```

Optional:

```bash
npm run lint
```

## 5) Start the dev server (port 4000)

```bash
npm run dev:clean
```

This runs:
- `npm run clean:next`
- `next dev --port 4000`

## 6) Expected local URLs

- Public homepage: `http://localhost:4000/`
- Login page: `http://localhost:4000/login`
- Register page: `http://localhost:4000/register`
- Forgot password: `http://localhost:4000/forgot-password`
- Admin dashboard placeholder: `http://localhost:4000/admin`
- Parent dashboard placeholder: `http://localhost:4000/parent`
- Tutor dashboard placeholder: `http://localhost:4000/tutor`

Note: dashboard routes are protected and may redirect based on auth/session role.

## 7) Blank-page recovery (stale Next artifacts)

If the app starts but the browser is blank, run:

```bash
npm run clean:next
npm run dev:clean
```

Then hard refresh the browser (`Ctrl+F5` on Windows / `Cmd+Shift+R` on macOS).

## 8) Common failure symptoms and fixes

### Symptom: Missing `.next` chunks
Examples:
- `Cannot find module './276.js'`
- errors from `.next/server/webpack-runtime.js`

Fix:
1. Stop server.
2. `npm run clean:next`
3. `npm run dev:clean`
4. Hard refresh browser.

### Symptom: 404 for `/_next/static/...`

Fix: same cache-recovery steps above.

### Symptom: NextAuth warnings
Examples:
- `[next-auth][warn][NEXTAUTH_URL]`
- `[next-auth][warn][NO_SECRET]`

Fix:
- Set `NEXTAUTH_URL=http://localhost:4000` in `.env.local`.
- Set `NEXTAUTH_SECRET` in `.env.local`.
- Restart dev server.

### Symptom: Prisma type/import errors
Example:
- `Module '"@prisma/client"' has no exported member 'Prisma'`

Fix:
1. Ensure `.env.local` has a valid `DATABASE_URL`.
2. Run `npm run prisma:generate`.
3. Run `npm run typecheck`.

## 9) Script reference (verified in `package.json`)

- `npm run clean:next`
- `npm run dev:clean`
- `npm run dev:4000`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm run test`
- `npm run lint`
