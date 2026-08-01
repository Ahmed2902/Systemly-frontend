# Platform localization

Systemly platform language is independent from a business public-site language.

## Current behavior

- Supported locales: `en`, `ar`
- Locale source: `systemly_locale` cookie
- Default locale: English
- URL paths remain unchanged
- Root `<html>` receives the matching `lang` and `dir`
- Arabic uses the Cairo font
- The global language control updates the cookie and document direction immediately

## Adding messages

1. Add the same key to both locale objects in `messages.ts`.
2. Add the key to `MessageKey`.
3. Read it from a client component with:

```tsx
const { t } = useLocale();
return <span>{t("common.language")}</span>;
```

Server components can use `translate(locale, key)` after reading the locale cookie.

## Migration rules

- Keep API enum values in English machine-readable form and translate only their labels.
- Prefer logical CSS utilities (`start`, `end`, `ms`, `me`, `ps`, `pe`, `text-start`).
- Use `dir="auto"` for user-entered names, notes, services, and customer data when appropriate.
- Do not use `Business.language` for the platform UI; that field belongs to the public business website.
