# AGENTS.md — Hgezli Frontend

This is the main instruction file for agents working in the frontend repo `BusinessOs-frontend`.

## Important Next.js note

This repo uses Next.js 15 and React 19. Do not rely blindly on older Next.js assumptions. If changing framework-sensitive behavior, inspect the installed docs/types and existing code first.

## Read first

Before editing frontend code, read:

1. `docs/agent/FRONTEND_ARCHITECTURE.md`
2. `docs/agent/API_INTEGRATION.md`
3. `docs/agent/OPERATIONS_UI.md`
4. `docs/agent/BOOKING_AND_PUBLIC_SITE.md`
5. `docs/agent/FRONTEND_CODING_RULES.md`
6. `docs/agent/TASK_TEMPLATE.md` for complex tasks

Also read shared product context if copied into this repo:

- `docs/agent/PROJECT_CONTEXT.md`
- `docs/agent/PRODUCT_DECISIONS.md`

## Frontend stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/radix-style UI dependencies
- React Hook Form + Zod for forms
- Fetch API for backend calls

## Core rules

- Preserve the backend response envelope handling. Most APIs need to unwrap `json.data`.
- Use `apiUrl()` from `src/shared/lib/api-url.ts`; do not hardcode backend base URLs.
- Use `useAuth()` for authenticated client pages.
- Keep access token in memory through `AuthProvider`; do not move it to localStorage unless explicitly asked.
- Use `credentials: "include"` when calling cookie/refresh/session flows.
- Refresh operation state after mutations that change appointment or invoice status.
- Calendar must support multiple staff and multi-segment appointments.
- Do not expose owner-only analytics to staff/receptionist.

## Commands

Common frontend commands:

```bash
npm run dev
npm run build
npm run lint
```

## Expected workflow

1. Inspect the page, module API adapter, shared mapper, and backend contract.
2. Update types before component logic when API shape changes.
3. Keep UI state and server state in sync after mutations.
4. Run build/lint or explain why not.
5. Summarize changed files and behavior.
