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
