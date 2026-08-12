# Systemly Multi-Branch Frontend Rollout

> Read this document before every commit that touches the multi-branch rollout.
>
> Core invariant: **BusinessAdmin is business-scoped. Receptionist is branch-scoped. Operational pages always use exactly one branch. Dashboard analytics may use one branch or all branches.**

## Compatibility

- A business with one active branch keeps today's UX; auto-select the only active branch.
- Do not show an unnecessary branch selector for one-branch businesses.
- Do not expose `+ Add Branch` until the backend, public booking, operations, analytics and billing work are ready.
- Keep operational branch selection independent from analytics scope.
- Receptionists never choose or override their branch.

## Public website

There is one website per Business. Branding/content remain shared. Branch selection controls location/contact, services, team and booking availability. For multiple active branches, use a stable branch slug in the URL query (`?branch=<slug>`) so selection is shareable. One branch auto-selects.

## Public booking

For a multi-branch business, booking starts with branch/location selection before service, staff and time selection. A branch already selected on the public website may be carried into booking through the stable branch query. One-branch businesses skip the extra selection step.

## Owner operations

Calendar, Appointments, Staff, Services, Availability and invoice operations use exactly one active operational branch. Owners can change it. Changing the operational branch remounts the operational page so branch-scoped screens immediately reload from the newly selected location. Receptionists are fixed to their assigned branch and do not see the selector. Customers remain business-wide.

## Analytics

Dashboard scope is independent from operations and supports `All branches` or one branch. Changing dashboard scope must not change Calendar/Appointments/Staff/Services scope. The global operational branch selector is hidden on Dashboard so analytics does not present two competing branch selectors.

## Add Branch

Add Branch is a dedicated onboarding-style page rather than a modal. Steps: location/contact -> services & team/receptionist -> per-staff availability -> review/create. Do not ask for business identity or website branding again. Availability is configured independently for each provider; never copy one branch-wide schedule to every staff member. The first branch is included in Core; each additional active branch adds 350 EGP/month on the next renewal, with no V1 proration.

## PR sequence

1. Public website branch context.
2. Branch-aware public booking.
3. Owner operational branch selector.
4. Dashboard branch analytics scope.
5. Add Branch page, pricing UI and final activation/cleanup.

## Engineering constraints

- Do not over-engineer.
- Reuse existing API/client/context patterns.
- Do not use one global `selectedBranchId` for both operations and analytics.
- Keep URL/query behavior backward-compatible for one-branch businesses.
- Every PR must pass typecheck, lint, audit, build and smoke CI.