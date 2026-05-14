# 🎓 TopMox Global Tutoring Platform

## 📌 Project Overview

TopMox Global Tutoring is a school-backed online tutoring platform for parents in Nigeria and abroad.  
This app supports parent onboarding, child profile management, role-based dashboards, and the operational foundation for assessments, tutoring workflows, progress tracking, and reporting.

### 🧰 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth**
- **Tailwind CSS**

---

## ✅ Prerequisites

Before running the project locally, make sure you have:

- **Node.js 18+**
- **PostgreSQL** (running locally or remotely)
- **npm or yarn**

---

## 🚀 Setup Instructions

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd TopMox-School
```

### 2) Install dependencies

```bash
npm install
```

### 3) Set up environment variables

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

At minimum, set:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_DEMO_LOGIN_ENABLED`

### 4) Set up the database

1. Create a PostgreSQL database.
2. Generate Prisma Client:

```bash
npm run prisma:generate
```

3. Run migrations to create tables:

```bash
npm run prisma:migrate
```

4. Seed initial data:

```bash
npm run prisma:seed
```

### 5) Start the development server

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## 🛠️ Troubleshooting

### 1) Blank page when running dev server

- Make sure `.env` exists at the project root.
- Confirm `DATABASE_URL` is valid and points to an accessible PostgreSQL instance.
- If Next cache is stale, run:

```bash
npm run clean:next
npm run dev:clean
```

### 2) Prisma errors

- Regenerate Prisma Client:

```bash
npm run prisma:generate
```

- If Prisma binary download fails with `EAI_AGAIN`, retry on a stable internet connection (DNS/network issue).

### 3) Auth errors

- Ensure `AUTH_SECRET` is set in `.env`.
- Also keep `NEXTAUTH_SECRET` set (recommended to match `AUTH_SECRET`).
- Ensure `NEXTAUTH_URL` matches the local app URL.

---

## 📜 Available Scripts

### Development

- `npm run dev` → Start Next.js dev server (default port).
- `npm run dev:4000` → Start dev server helper on port `4000`.
- `npm run clean:next` → Remove `.next` and `node_modules/.cache`.
- `npm run dev:clean` → Clean cache and start dev server on port `4000`.
- `npm run verify:homepage` → Verify homepage + static asset responses.

### Build & Start

- `npm run build` → Build the production app.
- `npm run start` → Start production server.
- `npm run start:4000` → Start production server on port `4000`.

### Quality

- `npm run lint` → Run ESLint checks.
- `npm run lint:fix` → Run ESLint and auto-fix issues.
- `npm run format` → Format files with Prettier.
- `npm run format:check` → Check formatting without writing changes.
- `npm run typecheck` → Run TypeScript type checking.
- `npm run test` → Run automated tests.

### Prisma & Database

- `npm run prisma:generate` → Generate Prisma Client.
- `npm run prisma:migrate` → Run Prisma migrations in development.
- `npm run prisma:studio` → Open Prisma Studio.
- `npm run prisma:seed` → Seed the database.
- `npm run db:reset` → Reset database and reapply migrations.

---

## 👥 Notes for Contributors

- Keep `.env` and `.env.local` out of version control.
- Use the troubleshooting commands above if you see blank pages after code changes.
- Prefer running `lint`, `typecheck`, and `test` before opening PRs.
