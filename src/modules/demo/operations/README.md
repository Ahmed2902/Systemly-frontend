# Operations demo architecture

The public salon and clinic demos reuse the production operations pages.

## Boundaries

- `OperationsRuntimeProvider` supplies live or demo navigation/runtime metadata.
- `ApiTransport` is the request boundary used by existing API modules.
- `DemoApiTransport` owns an isolated `DemoOperationsStore` and delegates requests to focused handlers.
- Production routes use the normal fetch transport and existing backend APIs.
- Demo routes install the fake transport only while their layout is mounted.

## Demo state

The store starts from deterministic salon or clinic fixtures generated relative to the current Cairo date. Mutations update the in-memory state consistently across calendars, appointment lists, customers, invoices, staff, services, settings, and analytics. Reloading or using **Reset demo** restores the fixtures.

## Safety

The demo requires no authentication and never writes to the database. Upload helpers short-circuit to local object URLs, billing/invitation routes are hidden, and internal operations links are scoped to the active demo base path.

## Adding a capability

1. Keep visual and domain components in the production module.
2. Add or extend the API method in the normal module.
3. Implement the same request contract in the smallest relevant demo handler.
4. Derive cross-screen values from the shared store instead of duplicating fixture data.
