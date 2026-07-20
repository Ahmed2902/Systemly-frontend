# Booking and Public Site

## Public business page

Route:

```txt
src/app/[slug]/page.tsx
```

Behavior:

- Fetches `/businesses/public/:slug`.
- Returns 404 via `notFound()` if business missing.
- Looks up template with `getTemplateById(content?.template ?? "aura-wellness")`.
- Maps business data to template props.

Mapped data includes:

- business name
- tagline
- vertical
- template id
- about text
- logo URL
- hero photo
- gallery photos
- primary color
- section order
- showTeam/showFaq
- services
- staff
- FAQs
- phone/address/instagram/whatsapp

## Booking page

Route:

```txt
src/app/[slug]/book/page.tsx
```

Behavior:

- Fetches public business by slug.
- Loads selected template theme.
- Sets CSS variables for booking theme.
- Wraps `BookingShell` in `BookingProvider`.

## Booking API

File:

```txt
src/modules/booking/booking.api.ts
```

`getAvailability` calls:

```txt
GET /bookings/availability?businessId=...&date=...&services=<json>
```

`submitBooking` calls:

```txt
POST /bookings/
```

with selected services, start time, customer name/phone, and optional notes/source.

## Staff selection

Booking service selection can include `staffId`, but staff can also be omitted so backend auto-assigns capable available staff.

Do not force customer to choose staff unless the UX specifically requires it.

## Template guidance

Templates are website templates for businesses, not templates for Hgezli's own landing page.

Clinic and salon templates should represent the customer's public website, e.g. a clinic website or salon website generated for that business.

## Images

Frontend currently allows Supabase public storage images in `next.config.ts`.

If using Cloudinary or another host, update `remotePatterns` intentionally.

## Localization

The business model has `language` defaulting to `ar`. Keep Arabic/Egyptian business usage in mind. Do not hardcode English-only public copy where business language should control the UI.
