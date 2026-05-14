# Dev Troubleshooting

## Blank page after dev server starts

If the page is blank after the dev server starts, recover with this exact flow:

1. Stop the dev server.
2. Run `npm run clean:next`.
3. Run `npm run dev:clean`.
4. Hard refresh the browser (`Ctrl+F5` on Windows / `Cmd+Shift+R` on macOS).

This clears stale Next.js generated artifacts (`.next` and `node_modules/.cache`) before starting development on port `4000`.

## NextAuth warnings (`NEXTAUTH_URL` / `NO_SECRET`)

If you see warnings like:
- `[next-auth][warn][NEXTAUTH_URL]`
- `[next-auth][warn][NO_SECRET]`

configure local auth environment variables in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secure-random-string
```

Generate a secure secret with Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then restart the dev server.

## Prisma generate fails with EAI_AGAIN

If `prisma generate` fails with an error like:

- `getaddrinfo EAI_AGAIN binaries.prisma.sh`

this means the current environment could not resolve or reach Prisma's binary download host.

What this usually means:

- It is a DNS/network connectivity issue, not a Prisma schema or app code issue.
- If `lint`, `typecheck`, `test`, `build`, and homepage verification pass, this error should not be treated as the root cause of a blank page.
- Retry Prisma generation on a machine/network with stable internet access.

Commands to retry locally:

```bash
npx prisma generate
npm run typecheck
npm run build
```

Optional diagnostics:

```bash
nslookup binaries.prisma.sh
npm config get proxy
npm config get https-proxy
```
