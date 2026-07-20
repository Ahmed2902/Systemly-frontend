# Frontend API Integration

## Base helper

Always use:

```ts
apiUrl("/path")
```

from:

```txt
src/shared/lib/api-url.ts
```

It uses `NEXT_PUBLIC_BACKEND_URL` and safely joins paths.

## Backend response envelope

Backend responses usually look like:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{ "success": false, "error": "Message", "code": "ERROR_CODE" }
```

Frontend API helpers should unwrap `json.data` where appropriate.

## Auth API

`src/modules/auth/auth.api.ts` handles:

- `registerUser`
- `loginUser`
- `refreshAccessToken`
- `logoutUser`

Auth flow:

- Login/register uses `credentials: "include"` to receive refresh cookie.
- Refresh/logout use CSRF token from `getCsrfToken()`.
- Access token is stored in React state, not localStorage.

## Auth provider

`src/modules/auth/useAuth.tsx`:

- Bootstraps by calling `refreshAccessToken()`.
- Calls `/auth/me` with Bearer token.
- Refreshes access token every 13 minutes.
- Exposes `user`, `accessToken`, `loading`, `setSession`, `clearSession`, and `logout`.

When building authenticated pages:

- Guard against `authLoading`.
- Handle missing `user`.
- Handle missing `user.businessId`.
- Handle missing `accessToken`.

## Operations API adapter

`src/modules/operations/Calendar.api.ts` has a local `api<T>()` helper that:

- sends Bearer access token
- uses `credentials: "include"`
- parses JSON
- throws on non-ok or `success === false`
- unwraps `body.data`

Current operations calls:

- `getCalendarDay(businessId, date, accessToken)`
- `getServiceCatalog(businessId, accessToken)`
- `saveAppointment(appointment, accessToken)`
- `completeAppointment(appointmentId, accessToken)`
- `cancelAppointment(appointmentId, reason, accessToken)`
- `collectPayment(appointmentId, discountCents, accessToken)`
- `revertAppointment(appointmentId, accessToken, businessId)`
- `uncancelAppointment(appointmentId, accessToken, businessId)`
- `markNoShow(appointmentId, accessToken)`

## Important backend mismatch risk

`collectPayment()` currently maps the raw response through `mapBackendAppointment(raw)`. If backend returns an invoice instead of a full appointment, this mapping is wrong.

Safer options:

1. Change frontend `collectPayment()` to not map the response and rely on `reload()` after mutation.
2. Or change backend `collect-payment` to return the updated full appointment include.

Do not leave it half-mapped.

## Booking API

`src/modules/booking/booking.api.ts`:

- `getAvailability(businessId, services, date, timezone?)`
- `submitBooking(payload)`

Availability sends `services` as JSON string query param.

Booking submit sends:

```ts
{
  businessId: string;
  services: ServiceSelection[];
  startsAt: string;
  timezone?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  acquisitionSource?: string;
}
```

## After mutations

For operations calendar mutations, always refresh server state after success:

- save appointment
- complete
- cancel
- collect payment
- revert
- uncancel
- mark no-show

Do not only patch local state unless the backend returns the exact same full object the mapper expects.
