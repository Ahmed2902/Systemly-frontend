# Frontend Architecture

## Repo identity

Repo: `Ahmed2902/BusinessOs-frontend`

Package name: `hgezli-frontend`

Main stack:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Radix/shadcn-style UI dependencies
- Zod and React Hook Form

## App structure

Important app routes:

```txt
src/app/
  layout.tsx
  globals.css
  (marketing)/page.tsx
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (auth)/oauth-callback/page.tsx
  (onboarding)/onboarding/page.tsx
  [slug]/page.tsx
  [slug]/book/page.tsx
  operations/layout.tsx
  operations/calendar/page.tsx
```

Important modules:

```txt
src/modules/
  auth/
  onboarding/
  wizard/
  landing/
  templates/
  booking/
  operations/
```

Important shared paths:

```txt
src/shared/lib/api-url.ts
src/shared/lib/csrf.ts
src/shared/lib/Calendar/
src/shared/components/AuthGuard.tsx
```

## Root layout

`src/app/layout.tsx`:

- imports `globals.css`
- wraps the app in `AuthProvider`
- uses `Playfair_Display` and `Inter` from `next/font/google`

Do not remove `AuthProvider`; authenticated pages depend on it.

## API URL helper

Use:

```ts
import { apiUrl } from "@/shared/lib/api-url";
```

`apiUrl(path)` joins `NEXT_PUBLIC_BACKEND_URL` and the given path. Keep paths like `/auth/login`, `/appointments`, etc.

## Image config

`next.config.ts` currently allows:

- `via.placeholder.com`
- `*.supabase.co/storage/v1/object/public/**`

If Cloudinary images are used in frontend `<Image>`, add a proper `res.cloudinary.com` remote pattern instead of replacing image components randomly.

## Template/public site

Public business page:

- `src/app/[slug]/page.tsx`
- Fetches `/businesses/public/:slug`
- Selects a template through `getTemplateById`
- Maps backend business/website/photos/services/staff/faqs into `SalonTemplateData`

Booking page:

- `src/app/[slug]/book/page.tsx`
- Fetches the same public business endpoint
- Wraps `BookingShell` in `BookingProvider`

## Operations UI

Operations calendar:

- `src/app/operations/calendar/page.tsx`
- `src/modules/operations/Calendar.api.ts`
- `src/modules/operations/appointment.types.ts`
- `src/shared/lib/Calendar/adapter.ts`
- `src/modules/operations/components/CalendarGrid.tsx`
- `src/modules/operations/components/AppointmentEditPanel.tsx`

The calendar is staff rows + time columns. It flattens appointment segments by staff and renders each segment on the assigned staff row.
