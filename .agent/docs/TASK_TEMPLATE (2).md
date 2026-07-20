# Frontend Agent Task Template

Use this structure when giving Codex/frontend agents a task.

```md
## Goal

Describe the exact UI/API behavior to implement or fix.

## Relevant files to inspect first

- `src/app/...`
- `src/modules/...`
- `src/shared/lib/...`
- Backend route/service if API shape matters

## Current behavior

What currently happens?

## Expected behavior

What should happen?

## Constraints

- Use `apiUrl()`.
- Preserve auth flow.
- Do not rewrite unrelated UI.
- Reload server state after mutations.
- Keep multi-staff/multi-segment appointments supported.

## Acceptance criteria

- [ ] Build passes.
- [ ] UI state matches backend after mutation.
- [ ] Loading/error states handled.
- [ ] No role/security regression.

## Manual test steps

1. ...
```

## Example task: service-aware staff dropdown

```md
## Goal

In the appointment edit panel, the staff dropdown for each service segment should only show staff members who can perform that segment's service.

## Relevant files

Frontend:
- `src/modules/operations/appointment.types.ts`
- `src/shared/lib/Calendar/adapter.ts`
- `src/modules/operations/components/AppointmentEditPanel.tsx`
- `src/modules/operations/Calendar.api.ts`

Backend:
- `src/modules/staff/staff.service.ts`
- `prisma/schema.prisma` (`ServiceStaff`)

## Expected behavior

For each segment, filter staff options using service eligibility. If current selected staff is no longer eligible, show a clear validation state and require change before save.
```
