# Operations UI

## Product goal

The operations UI is for daily staff/receptionist/admin work: seeing appointments, editing service segments, collecting cash payment, cancelling, marking no-show, and handling appointment notes/history.

Owner-only analytics should be separate from this flow.

## Calendar design

The current direction is:

- staff in rows
- time in columns
- appointments rendered as service segments inside each staff row

This is intentional because businesses may have many staff and a single customer appointment can involve multiple staff members.

## Key files

```txt
src/app/operations/calendar/page.tsx
src/modules/operations/Calendar.api.ts
src/modules/operations/appointment.types.ts
src/modules/operations/components/CalendarGrid.tsx
src/modules/operations/components/AppointmentSegmentBlock.tsx
src/modules/operations/components/AppointmentEditPanel.tsx
src/shared/lib/Calendar/adapter.ts
src/shared/lib/Calendar/conflicts.ts
src/shared/lib/Calendar/grid.utils.ts
```

## Data shape

`AppointmentSummary`:

- `id`
- `date`
- `customer`
- `status`
- `isLocked`
- `isPaid`
- `segments`
- `customItems`
- `discount`
- `notes`

`AppointmentSegment`:

- `id`
- `appointmentId`
- `serviceId`
- `serviceName`
- `staffId`
- `startsAt`
- `endsAt`
- `price`
- `segmentIndex`
- `segmentCount`

## Current mapper logic

`mapBackendAppointment(raw)` maps:

- `raw.appointmentServices` to segments
- `raw.customer` to customer profile
- `raw.invoice.status === "paid"` to `isPaid`
- `raw.status === "completed" || raw.invoice?.status === "paid"` to `isLocked`
- `raw.customItems` to custom line items

If backend response does not include these relations, the UI will show incomplete or wrong state.

## Staff rows

`CalendarGrid` flattens all appointment segments by `staffId`, then renders each segment under its assigned staff row.

Do not change this back to one appointment card per appointment; that breaks multi-staff support.

## Appointment side panel behavior

The edit panel supports:

- viewing customer name/phone
- visits/no-show count
- editing segments while unlocked
- changing staff/time for each segment
- local staff conflict detection
- adding services
- adding custom items
- notes
- discount
- save changes
- cancel appointment
- uncancel only when cancelled by business
- mark no-show only when confirmed
- collect payment
- mark complete without payment
- revert when locked

## Locking rules

Frontend `locked` should match backend helper:

```txt
locked = status completed OR invoice paid
```

When locked:

- do not allow segment edits
- do not allow notes/discount edits through normal save
- show Revert if reopening is allowed

## Known UI bug class

Cancel/uncancel/revert buttons must be based on correct state:

- `Cancel Appt` should be disabled if appointment is locked or already cancelled.
- `Uncancel` should only appear for cancelled appointments.
- `Revert` should appear for paid/completed/no-show reopening flows, not as a replacement for uncancel.

If collect payment makes `Cancel Appt` disabled and shows `Uncancel` incorrectly, inspect mapper and state conditions first.

## Staff eligibility

Current `StaffMember` type does not include service capability IDs.

Product need:

When changing a segment's staff, the dropdown should only include staff assigned to that service through `ServiceStaff`.

Recommended future type change:

```ts
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  serviceIds?: string[];
}
```

Then map backend `staff.serviceStaff` to `serviceIds`, and filter the dropdown per segment by `seg.serviceId`.

## Refresh after mutations

The calendar page already has a `reload()` function. Use it after every appointment/invoice mutation. Avoid relying on stale selected object after a mutation.
