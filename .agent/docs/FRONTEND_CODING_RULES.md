# Frontend Coding Rules

## General

- Keep components focused and readable.
- Prefer existing module structure over new global abstractions.
- Use TypeScript types from each module.
- Keep data mapping in adapters, not scattered across components.
- Do not hardcode backend URLs.
- Do not store access tokens in localStorage.
- Use `credentials: "include"` for cookie-aware auth flows.

## Next.js

- This repo uses App Router.
- Client components need `"use client"` at the top.
- Server components can fetch public backend data with `cache: "no-store"` when freshness matters.
- Dynamic route params are typed as `Promise<{ slug: string }>` in existing Next 15 code. Follow existing pattern unless changing intentionally.

## Styling

- Tailwind is the default styling approach.
- Keep the current visual direction unless the user asks for redesign.
- For operations UI, prioritize usability over flashy visuals.
- Avoid making the calendar messy with many staff; prefer search/jump, sticky labels, grouping, and scrollable rows.

## API handling

- Throw backend JSON error objects when possible so UI can show useful messages.
- Unwrap `json.data` only once.
- After server mutations, reload authoritative server state unless backend returns an exact fresh object.

## Calendar and appointment rules

- Never assume one appointment has one service.
- Never assume one appointment has one staff member.
- Render and edit service segments individually.
- Keep frontend `isLocked` logic synced with backend.
- Do not show `Uncancel` unless status is cancelled.
- Do not show normal editing controls when locked.

## Common pitfalls

- Mapping invoice response as appointment response.
- Forgetting to reload after collect payment.
- Missing `businessId` from authenticated user.
- Calling staff breaks endpoint without date query.
- Adding Cloudinary image URLs without updating Next image remote patterns.
- Filtering staff by all staff instead of service eligibility.
