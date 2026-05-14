# task-list.md

# TopMox Global Tutoring Task List

## Build Strategy

We are starting from a clean project.

The build should follow this sequence:

1. Foundation.
2. Database and auth.
3. Public marketing pages.
4. Parent onboarding.
5. Assessment system.
6. Plan recommendation and enrollment.
7. Payments.
8. Tutor assignment and lessons.
9. Progress reports.
10. Dashboards.
11. Support and communication logs.
12. Resources.
13. Testing and polish.

Do not jump randomly between features.  
Complete each layer before moving to the next.

---

## Phase 0: Project Setup

### Tasks

- [ ] Create new Next.js App Router project.
- [ ] Add TypeScript.
- [ ] Add Tailwind CSS.
- [ ] Add shadcn/ui.
- [ ] Add Framer Motion.
- [ ] Add Lucide React.
- [ ] Add Prisma.
- [ ] Add PostgreSQL connection.
- [ ] Add Zod.
- [ ] Add React Hook Form.
- [ ] Configure linting.
- [ ] Configure formatting.
- [ ] Create base folder structure.

### Folder Structure

```txt
src/
  app/
  components/
    marketing/
    dashboard/
    forms/
    reports/
    shared/
  lib/
    auth/
    validations/
    constants/
    utils/
    demo-data/
  server/
    actions/
    queries/
  styles/
prisma/
  schema.prisma
docs/
  prd.md
  design.md
  task-list.md
```
