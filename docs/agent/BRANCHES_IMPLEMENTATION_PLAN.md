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

There is one website per Business. Branding/content remain shared. Branch selection controls location/contact, services, team and booking availability. For multiple active branches, use a stable branch slug in the URL query (`?branch=<slug>`) so selection is shareable. One branch auto-selects. Once a Branch is selected, public address/phone/location data comes from that Branch only; never substitute legacy Business location data.

## Public booking

For a multi-branch business, booking starts with branch/location selection before service, staff and time selection. A branch already selected on the public website may be carried into booking through the stable branch query. One-branch businesses skip the extra selection step. After selecting a branch, the booking flow must offer a simple way to return to branch selection without losing the branch-first model.

## Owner operations

Calendar, Appointments, Staff, Services, Availability and invoice operations use exactly one active operational branch. Owners can change it. Changing the operational branch remounts the operational page so branch-scoped screens immediately reload from the newly selected location. Receptionists are fixed to their assigned branch and do not see the selector. Customers remain business-wide.

Business Settings contains only business-wide identity/branding/website controls. Branch phone, address, city and location data are edited from Branches so the UI does not create a second location source of truth.

## Analytics

Dashboard scope is independent from operations and supports `All branches` or one branch. Changing dashboard scope must not change Calendar/Appointments/Staff/Services scope. The global operational branch selector is hidden across the entire Dashboard subtree so analytics never presents two competing branch selectors.

## Add Branch

Add Branch is a dedicated onboarding-style page rather than a modal. Steps: location/contact -> services & team/receptionist -> per-staff availability -> review/create. Do not ask for business identity or website branding again. Availability is configured independently for each provider; never copy one branch-wide schedule to every staff member. The first branch is included in Core; each additional active branch adds 350 EGP/month on the next renewal, with no V1 proration.

The frontend holds the entire draft locally until Review/Create. It then sends exactly one `POST /branches/setup` request containing location, services, team assignments, per-staff availability and the optional receptionist email. The backend validates the complete payload and commits all branch-owned data in one transaction. If the request fails, no Branch exists and there is no frontend cleanup/deactivation sequence.

## Billing and timezone

- Billing screens use the backend branch-pricing breakdown for the displayed monthly/next-renewal amount instead of showing only the 799 EGP base plan.
- V1 is Egypt-only. Branch setup does not expose a timezone selector; branch scheduling uses `Africa/Cairo`.
- A branch cannot be deactivated while it still has active/upcoming appointments; surface the backend conflict rather than hiding those visits.
- New subscription payments keep the server pricing snapshot that explains the charged amount even if branch pricing changes later.

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
