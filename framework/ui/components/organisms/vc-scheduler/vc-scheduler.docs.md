---
title: VcScheduler
category: components
group: data-display
---

# VcScheduler

A calendar organism for planning date-bound periods -- promotions, pricelist windows, campaigns. It defaults to a Month grid where all-day events render as bars (stacking into lanes when they overlap, with a "+N more" overflow popover) and shorter events render as timed chips. It can also switch to a vertical time-grid Timeline (Day or Week) rendering of the same events.

## Quick Start

```vue
<template>
  <div style="height: 640px">
    <VcScheduler
      v-model:view="view"
      v-model:date="date"
      :events="events"
      editable
      @event-update="onEventUpdate"
      @event-create="onEventCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcScheduler } from "@vc-shell/framework";
import type { ISchedulerEvent, SchedulerView } from "@vc-shell/framework";

const view = ref<SchedulerView>("month");
const date = ref(new Date());

const events = ref<ISchedulerEvent[]>([{ id: "e1", title: "Summer Sale", start: new Date("2026-07-01"), end: new Date("2026-07-06"), allDay: true }]);

function onEventUpdate(u: { id: string; start: Date; end: Date; title?: string; allDay?: boolean; color?: string }) {
  const event = events.value.find((e) => e.id === u.id);
  if (event) Object.assign(event, u);
}

function onEventCreate(c: { start: Date; end: Date; allDay: boolean; title: string; color?: string }) {
  events.value.push({ id: crypto.randomUUID(), ...c });
}
</script>
```

`VcScheduler` needs an explicit height from its parent -- it fills `height: 100%` internally but does not impose one of its own.

## Table of Contents

1. [Views](#views)
2. [Event Model](#event-model)
3. [Editable Events](#editable-events)
4. [Editing UX: Quick-Create Popover and Editor Modal](#editing-ux-quick-create-popover-and-editor-modal)
5. [Recurring Events](#recurring-events)
6. [Overlapping Events and Overflow](#overlapping-events-and-overflow)
7. [Custom Slots](#custom-slots)
8. [Timeline View](#timeline-view)
9. [Props](#props)
10. [Events](#events)
11. [Slots](#slots)
12. [CSS Custom Properties](#css-custom-properties)
13. [Recipes](#recipes)
14. [Common Mistakes](#common-mistakes)
15. [Accessibility](#accessibility)
16. [Related Components](#related-components)

---

## Views

`view` selects the active calendar view and defaults to `"month"`. Bind it with `v-model:view` so the built-in toolbar's view switcher stays in sync with your state:

```vue
<VcScheduler v-model:view="view" v-model:date="date" :events="events" />
```

| View              | Data props | Description                                                                                        |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `"month"`         | `events`   | Default. A 6-week grid; all-day events as bars, short events as chips.                             |
| `"timeline-day"`  | `events`   | The same events on a vertical hour grid for one focused day. See [Timeline View](#timeline-view).  |
| `"timeline-week"` | `events`   | The same events on a vertical hour grid across 7 day columns. See [Timeline View](#timeline-view). |

`date` is the focused date (which month is shown, or the timeline's focused day/week). Bind it with `v-model:date` so the toolbar's prev/next/today controls update your state:

```vue
<VcScheduler v-model:date="date" :events="events" />
```

All three views render the same `events` array -- switching `view` only changes how they're laid out (month grid vs. vertical time grid), never which data prop is read.

By default only **Month** is offered and the toolbar's view switcher is hidden -- the hour-granular timelines are opt-in, best suited to intraday/timed scheduling rather than the multi-day promo/pricelist norm. Pass the `views` prop to expose them (order preserved; the switcher appears once more than one view is listed):

```vue
<VcScheduler :views="['month', 'timeline-day', 'timeline-week']" :events="events" />
```

## Event Model

```ts
interface ISchedulerEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  /** Forces bar (true) or chip (false) rendering. Inferred from duration when omitted. */
  allDay?: boolean;
  /** Optional explicit color (CSS color or var()). Omit it and the event is auto-colored:
   *  a deterministic palette color is derived from the title at render time (same title →
   *  same color, recurring occurrences included), so you never store colors. Set this only
   *  to override. The editor's manual Color field is hidden unless `allow-color` is set. */
  color?: string;
  /** Per-event override of the global `editable` prop. */
  editable?: boolean;
  /** Free-form data for custom slots/handlers. */
  meta?: Record<string, unknown>;
  /** RRULE string on a master event, e.g. "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU;COUNT=10". */
  recurrence?: string;
  /** Occurrence start dates removed from the master series. */
  exceptionDates?: Date[];
  /** On an override event: id of the master series it belongs to. */
  recurrenceId?: string;
  /** On an override event: the original occurrence start it replaces. */
  originalStart?: Date;
}
```

An event renders as a full-width **bar** spanning its day columns when `allDay` is `true`, or when omitted and `end - start >= 24h`. Anything shorter renders as a compact **chip** showing `HH:mm` plus the title, listed under its day cell.

The last four fields (`recurrence`, `exceptionDates`, `recurrenceId`, `originalStart`) only matter for recurring series -- see [Recurring Events](#recurring-events).

## Editable Events

Set `editable` to allow drag-to-move and drag-to-resize on existing event bars, and to enable creating new events by clicking or dragging on an empty cell. Moves and resizes commit on pointer-up via `event-update`; empty-cell interactions open the built-in quick-create popover or editor modal, which commit via `event-create` -- see [Editing UX](#editing-ux-quick-create-popover-and-editor-modal) for the full interaction model.

```vue
<VcScheduler v-model:date="date" :events="events" editable @event-update="onEventUpdate" @event-create="onEventCreate" />
```

To make only _some_ events editable, use `isEventEditable` -- it is re-evaluated on every render, so an inline arrow function is safe:

```vue
<VcScheduler :events="events" editable :is-event-editable="(e) => e.meta?.locked !== true" />
```

An event can also opt out individually via its own `editable: false` field, independent of the global prop.

## Editing UX: Quick-Create Popover and Editor Modal

With `editable`, `VcScheduler` ships a complete built-in create/edit flow -- no host-side modal wiring required:

| Gesture                               | Result                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolbar **"+ New event"** button      | Opens the **editor modal** (create mode) for an all-day event on the focused date. Shown whenever `editable`.                                                                                                                                                             |
| Single click on an empty cell         | Opens the **quick-create popover**, anchored to the cell, with a title field.                                                                                                                                                                                             |
| Double click on an empty cell         | Opens the **editor modal** directly (create mode) -- richer fields, no popover.                                                                                                                                                                                           |
| Drag across empty cells               | Opens the **editor modal** (create mode) pre-filled with the dragged range.                                                                                                                                                                                               |
| Click an existing event               | Opens the built-in quick-info popover (unless `quickInfo` is `false`): a color-tinted header with the title, the date/time, a human-readable recurrence summary for recurring events, an optional category line from `meta.category`/`meta.description`, and Edit/Delete. |
| Quick-info popover's "Edit" button    | Opens the **editor modal** (edit mode), pre-filled from the event.                                                                                                                                                                                                        |
| Quick-create popover's "More options" | Opens the **editor modal** (create mode), carrying over the typed title.                                                                                                                                                                                                  |

The editor modal additionally exposes all-day toggle, start/end date-time, and color, plus a Delete action in edit mode (commits via `event-delete`). Saving from either surface emits the public `event-create`/`event-update` event -- see [Events](#events) for the exact payloads.

For an **all-day** event the editor's End field is the last day the event covers, matching what the chip and the quick-info popover announce -- so a one-day event has End equal to Start. The `end` in the emitted payload is still the exclusive midnight boundary the layout works in; the editor converts on save. An End before Start is refused rather than saved.

This entire flow is internal state: no `v-model` or extra event wiring is needed to make it work, beyond `editable` and the `event-create`/`event-update`/`event-delete` handlers you already have for persisting the result.

### `editorMode`: opting out of the built-in UI

Set `editorMode="emit"` to skip the quick-create popover and editor modal entirely and drive your own create/edit UI instead. In this mode:

- A create gesture (any of the rows above) emits `event-create` directly with an empty `title`, instead of opening a popover/modal.
- Clicking an event's quick-info "Edit" button emits `event-edit` with the full event, instead of opening the editor modal. (`event-edit` never fires in the default `"builtin"` mode.)

```vue
<VcScheduler :events="events" editable editor-mode="emit" @event-create="openMyCreateDialog" @event-edit="openMyEditDialog" />
```

### Customizing the built-in surfaces: `#quick-create` and `#event-editor`

To keep the built-in orchestration (state, anchoring, intent handling) but swap in your own markup, override the `#quick-create` and/or `#event-editor` slots:

```vue
<VcScheduler :events="events" editable>
  <template #quick-create="{ open, anchorRect, draft, save, more, close }">
    <MyQuickCreate :open="open" :anchor-rect="anchorRect" :draft="draft" @save="save" @more="more" @close="close" />
  </template>
  <template #event-editor="{ open, mode, draft, save, delete: onDelete, close }">
    <MyEventEditor :open="open" :mode="mode" :draft="draft" @save="save" @delete="onDelete" @close="close" />
  </template>
</VcScheduler>
```

| Slot           | Scope                                            | Description                                                                                                    |
| -------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `quick-create` | `{ open, anchorRect, draft, save, more, close }` | Replaces the quick-create popover. `save({ title })` commits; `more({ title })` should route into your editor. |
| `event-editor` | `{ open, mode, draft, save, delete, close }`     | Replaces the editor modal. `mode` is `"create"` \| `"edit"`; `save(draft)` commits; `delete({ id })` removes.  |

`draft` is an `IEventDraft` (`{ id?, title, start, end, allDay, color? }`) -- the working copy being created or edited.

## Recurring Events

An event with a non-empty `recurrence` field is a **master**: `recurrence` is a bare [RRULE](https://icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html) string (e.g. `"FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=8"`) and the master's own `start`/`end` act as `DTSTART`/duration. `VcScheduler` expands each master into concrete **occurrences** for whatever window the active view renders -- occurrences are synthesized, not stored, and carry a "↻" marker (Month bar/chip, Timeline bar, mobile agenda row) so they're visually distinguishable from one-off events.

Occurrences are **not limited to a single day**: the master's `start`->`end` duration is preserved for every occurrence, so a multi-day master (all-day or timed) yields multi-day occurrences that render as spanning bars. For example, an all-day master `start: Fri 00:00`, `end: Mon 00:00` with `FREQ=WEEKLY;BYDAY=FR` repeats a 3-day Fri->Sun span every week (see the `RecurringMultiDay` story).

This is an **iCal-style storage model** -- your `events` array holds only masters and overrides, never the expanded occurrences:

- **Master**: one event with `recurrence` set. Its own `start`/`end` is also the first occurrence.
- **Exception dates**: `exceptionDates` on the master lists occurrence start times to skip entirely -- no occurrence is synthesized for them, and no override is required.
- **Override**: a separate, ordinary event (no `recurrence` of its own) with `recurrenceId` set to the master's `id` and `originalStart` set to the occurrence start it replaces. Any other field (`title`, `start`, `end`, `color`, ...) can differ from the synthesized occurrence -- this is how a single instance of a series gets moved, retitled, or recolored without touching the rest of the series.

```ts
const master: ISchedulerEvent = {
  id: "m1",
  title: "Weekly Pricing Sync",
  start: new Date("2026-07-01T09:00:00"),
  end: new Date("2026-07-01T10:00:00"),
  recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=8",
  exceptionDates: [new Date("2026-07-08T09:00:00")], // that Wednesday is skipped
};

const override: ISchedulerEvent = {
  id: "o1",
  title: "Pricing Sync (moved to afternoon)",
  start: new Date("2026-07-13T14:00:00"),
  end: new Date("2026-07-13T15:00:00"),
  recurrenceId: "m1",
  originalStart: new Date("2026-07-13T09:00:00"), // the occurrence it replaces
};
```

### Creating/editing recurrence: the editor's Repeat form

The built-in editor modal (see [Editing UX](#editing-ux-quick-create-popover-and-editor-modal)) exposes a **Repeat** field when creating a new event or editing a master's "All events" scope (see below): `None` / `Daily` / `Weekly` / `Monthly` / `Yearly`, an **every N** interval, weekday toggles (`Weekly` only, multi-select), and an **End** setting (`Never`, `After N occurrences`, or `On` a specific date). The editor bridges this form to/from the stored `recurrence` RRULE string -- hosts never construct or parse RRULE text themselves.

### Editing or deleting an occurrence: the This event / All events prompt

Clicking **Edit** or **Delete** on a recurring occurrence (in the quick-info popover or elsewhere) opens a scope dialog asking **This event** or **All events** before doing anything else:

| Action | Scope          | Effect                                                                                                                                                                           |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edit   | **This event** | Opens the editor for just that occurrence, with no recurrence field (an override isn't itself recurring). Saving creates or updates an override -- only that occurrence changes. |
| Edit   | **All events** | Opens the editor pre-filled with the master's own fields and recurrence rule. Saving updates the master -- every occurrence reflects the change.                                 |
| Delete | **This event** | Adds the occurrence's date to the master's `exceptionDates` and removes its override, if any -- only that occurrence disappears.                                                 |
| Delete | **All events** | Deletes the master itself -- the whole series (and any of its overrides) disappears.                                                                                             |

This scope choice only appears for occurrences of a recurring series (`recurrenceId` set); plain events and masters/overrides edited directly are unaffected.

### Extended `event-create` / `event-update` payloads

Recurrence routes through the same `event-create`/`event-update`/`event-delete` events already used for plain events (see [Events](#events)), with additional optional fields:

- `event-create` gains `recurrence?: string` (creating a new recurring master) and `recurrenceId?: string` / `originalStart?: Date` (creating a first-time override for a "This event" edit).
- `event-update` gains `recurrence?: string` (an "All events" edit changing the rule), `exceptionDates?: Date[]` (a "This event" delete), and `recurrenceId?: string` / `originalStart?: Date` (updating an existing override).

A host persisting events must apply these the same way the master/override model expects -- merge `event-update` onto the event matching `id`, and for `event-create`, push a master when `recurrence` is set or an override when `recurrenceId` is set. See the `RecurringEvents` story for a complete, working example of both.

### Out of scope

- **"This and following"** scope (edit/delete from an occurrence forward) -- only "This event" and "All events" are supported.
- **Advanced RRULE features** such as `BYSETPOS` or nth-weekday-of-month (e.g. "2nd Tuesday") -- the editor's Repeat form only produces `FREQ`/`INTERVAL`/`BYDAY`/`COUNT`/`UNTIL`.
- **`TZID`/timezone-aware recurrence** -- `recurrence` is evaluated against the master's own `start`/`end` as plain `Date` values, with no timezone conversion.
- **Dragging an occurrence** to move or resize it -- Month/Timeline drag-to-move/resize targets an event by `id`, and a synthesized occurrence has no `id` of its own in `events`; use the This event/All events edit flow instead.

## Overlapping Events and Overflow

All-day events that overlap in time on the same days are packed into separate stacked lanes automatically -- no configuration needed. When a day would need more lanes than fit, the extra events collapse into a "+N more" button; activating it -- by click or by keyboard -- opens a popover listing every all-day event on that date.

## Custom Slots

Override event content or the entire toolbar without losing built-in interaction:

```vue
<VcScheduler v-model:view="view" v-model:date="date" :events="events">
  <template #event="{ event }">
    <strong>{{ event.title }}</strong>
  </template>
  <template #toolbar="{ title, view }">
    <div>{{ title }} -- {{ view }}</div>
  </template>
</VcScheduler>
```

The `event` and `event-popover` slots work identically in Timeline view; `empty` is Timeline-only, shown when no events fall in the visible window -- see [Timeline View](#timeline-view).

## Timeline View

Set `view` to `"timeline-day"` or `"timeline-week"` to render the same `events` array on a vertical time grid (hours down the Y axis, days across the X axis) instead of the Month grid -- no separate data props, and no `resources`/`bars` model. Switch views from the built-in toolbar (Month | Timeline Day | Timeline Week), or drive `view` directly:

```vue
<VcScheduler v-model:view="view" v-model:date="date" :events="events" />
```

- **Timeline Day** shows one focused day (`date`) as a single vertical hour column.
- **Timeline Week** shows 7 day columns starting from `firstDayOfWeek` over a shared hour axis -- all 7 fit on screen, no horizontal scrolling.

Both render day header(s) with an hour gutter down the left, and scroll vertically on mount to the first event (or the working hours). Timed events are placed by their exact start/end time and split into side-by-side lanes when they overlap; all-day / multi-day events sit in a spanning strip above the grid (a single-day column can't represent a multi-day span). Clicking an event opens the same quick-info popover as Month view (unless `quickInfo` is `false`). When today is in view (and within the shown hour range), a thin red **current-time line** is drawn in the today column, updated each minute.

Narrow the rendered hour range with `dayStartHour`/`dayEndHour` (default `0`/`24`), e.g. to show only an 8 AM-8 PM business-hours window:

```vue
<VcScheduler view="timeline-day" :events="events" :day-start-hour="8" :day-end-hour="20" />
```

The `empty` slot replaces the placeholder shown when no events fall in the visible window.

See the [Timeline recipe](#timeline-business-hours-review) below for a full example.

## Props

| Prop              | Type                              | Default      | Description                                                                                                                                                                                                                             |
| ----------------- | --------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `events`          | `ISchedulerEvent[]`               | `[]`         | Events to render, in all views.                                                                                                                                                                                                         |
| `view`            | `SchedulerView`                   | `"month"`    | Active view (`"month"` \| `"timeline-day"` \| `"timeline-week"`). Bind with `v-model:view`.                                                                                                                                             |
| `date`            | `Date`                            | `new Date()` | Focused date -- the month shown (Month), or the focused day/week (Timeline). Bind with `v-model:date`.                                                                                                                                  |
| `editable`        | `boolean`                         | `false`      | Enables drag-to-move / drag-to-resize on events, and click/drag-to-create on empty cells.                                                                                                                                               |
| `firstDayOfWeek`  | `number`                          | `1`          | First column of the Month grid, or first day of a Timeline Week (0 = Sunday, 1 = Monday).                                                                                                                                               |
| `isEventEditable` | `(e: ISchedulerEvent) => boolean` | `undefined`  | Per-event override of `editable`. Re-evaluated every render.                                                                                                                                                                            |
| `quickInfo`       | `boolean`                         | `true`       | Opens the built-in quick-info popover on event click. Disable for a fully custom click flow.                                                                                                                                            |
| `dayStartHour`    | `number`                          | `0`          | Timeline views. First rendered hour column (0-23).                                                                                                                                                                                      |
| `dayEndHour`      | `number`                          | `24`         | Timeline views. Last rendered hour column, exclusive (1-24).                                                                                                                                                                            |
| `editorMode`      | `"builtin"` \| `"emit"`           | `"builtin"`  | `"builtin"` opens the quick-create popover / editor modal for create and edit. `"emit"` skips both and re-emits the intent as `event-create`/`event-edit` instead. See [Editing UX](#editing-ux-quick-create-popover-and-editor-modal). |
| `loading`         | `boolean`                         | `false`      | Async loading. With no events yet, shows a view-shaped skeleton; while events already exist (a refresh), shows a loading overlay over the current content. Override the skeleton via the `#loading` slot.                               |

## Events

| Event          | Payload                                                                                                                                                                               | Description                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:view`  | `SchedulerView`                                                                                                                                                                       | Fires when the toolbar's view switcher changes the active view.                                                                                                                                                                                     |
| `update:date`  | `Date`                                                                                                                                                                                | Fires when the toolbar's prev/next/today controls change the focused date.                                                                                                                                                                          |
| `event-click`  | `ISchedulerEvent`                                                                                                                                                                     | Fires when an event bar or chip is activated (click or Enter), in any view.                                                                                                                                                                         |
| `event-create` | `{ start: Date; end: Date; allDay: boolean; title: string; color?: string; recurrence?: string; recurrenceId?: string; originalStart?: Date }`                                        | Fires when the quick-create popover or editor modal (create mode) is saved, in any view. `recurrence` is set for a new recurring master; `recurrenceId`/`originalStart` for a new occurrence override -- see [Recurring Events](#recurring-events). |
| `event-update` | `{ id: string; start: Date; end: Date; title?: string; allDay?: boolean; color?: string; recurrence?: string; exceptionDates?: Date[]; recurrenceId?: string; originalStart?: Date }` | Fires after a drag-move/drag-resize commits, or the editor modal (edit mode) is saved, in any view. The recurrence fields are only set by the This event/All events flow -- see [Recurring Events](#recurring-events).                              |
| `event-edit`   | `ISchedulerEvent`                                                                                                                                                                     | Only in `editorMode="emit"`: fires when the quick-info popover's "Edit" button is clicked, instead of opening the built-in editor.                                                                                                                  |
| `event-delete` | `{ id: string }`                                                                                                                                                                      | Fires when the quick-info popover's "Delete" button, or the editor modal's "Delete" button, is clicked.                                                                                                                                             |

## Slots

| Slot            | Scope                                            | Description                                                                                                      |
| --------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `event`         | `{ event }`                                      | Replaces an event's inner content, in any view. Defaults to `event.title`.                                       |
| `toolbar`       | `{ title, view }`                                | Replaces the entire built-in toolbar.                                                                            |
| `event-popover` | `{ event, close }`                               | Replaces the built-in quick-info popover's content, in any view.                                                 |
| `quick-create`  | `{ open, anchorRect, draft, save, more, close }` | Replaces the built-in quick-create popover. See [Editing UX](#editing-ux-quick-create-popover-and-editor-modal). |
| `event-editor`  | `{ open, mode, draft, save, delete, close }`     | Replaces the built-in editor modal. See [Editing UX](#editing-ux-quick-create-popover-and-editor-modal).         |
| `empty`         | --                                               | Timeline view. Replaces the empty-state shown when no events are in view.                                        |
| `loading`       | --                                               | Replaces the built-in first-load skeleton (shown when `loading` and no events yet).                              |

## CSS Custom Properties

| Property                    | Default                | Description                                                                                                                                                                                       |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--scheduler-border-color`  | `var(--neutrals-200)`  | Border color for the grid, header, and row separators.                                                                                                                                            |
| `--scheduler-surface-color` | `var(--additional-50)` | Surface the whole component paints, toolbar and weekday header included. It owns its background because it draws its own border and radius -- do not rely on the host's backdrop showing through. |
| `--vc-scheduler-event-ink`  | `#fff`                 | Text color on Month-view event bars/chips.                                                                                                                                                        |
| `--z-critical-popup`        | (theme z-index scale)  | Stacking context for the "+N more" overflow popover.                                                                                                                                              |
| `--z-local-sticky`          | (theme z-index scale)  | Timeline view. Stacking context for the sticky two-tier header.                                                                                                                                   |

Event fill color comes from `color` (any CSS color or `var(...)` reference) and defaults to `var(--primary-500)`. Event label text is white by default -- see [Common Mistakes](#common-mistakes).

## Recipes

### Month: promotions calendar with drag-to-create

```vue
<template>
  <div style="height: 640px">
    <VcScheduler
      v-model:date="date"
      :events="promotions"
      editable
      :is-event-editable="(e) => !lockedIds.has(e.id)"
      @event-update="onEventUpdate"
      @event-create="onEventCreate"
      @event-click="(e) => (selectedPromotion = e)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcScheduler } from "@vc-shell/framework";
import type { ISchedulerEvent } from "@vc-shell/framework";

const date = ref(new Date("2026-07-01"));

const promotions = ref<ISchedulerEvent[]>([
  { id: "p1", title: "Summer Sale", start: new Date("2026-07-01"), end: new Date("2026-07-14"), allDay: true },
  { id: "p2", title: "Loyalty pricing review", start: new Date("2026-07-15T09:00:00"), end: new Date("2026-07-15T10:00:00") },
]);

const lockedIds = new Set(["p1"]);
const selectedPromotion = ref<ISchedulerEvent | null>(null);

function onEventUpdate(u: { id: string; start: Date; end: Date; title?: string; allDay?: boolean; color?: string }) {
  const promo = promotions.value.find((p) => p.id === u.id);
  if (promo) Object.assign(promo, u);
}

function onEventCreate(c: { start: Date; end: Date; allDay: boolean; title: string; color?: string }) {
  promotions.value.push({ id: crypto.randomUUID(), ...c });
}
</script>
```

### Timeline: business-hours review

```vue
<template>
  <div style="height: 500px">
    <VcScheduler
      view="timeline-day"
      v-model:date="date"
      :events="reviews"
      :day-start-hour="8"
      :day-end-hour="20"
      editable
      @event-update="onEventUpdate"
      @event-click="(e) => (selectedReview = e)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcScheduler } from "@vc-shell/framework";
import type { ISchedulerEvent } from "@vc-shell/framework";

const date = ref(new Date(2026, 6, 15));

const reviews = ref<ISchedulerEvent[]>([
  { id: "r1", title: "Pricing sync", start: new Date("2026-07-15T09:00:00"), end: new Date("2026-07-15T10:00:00") },
  { id: "r2", title: "Loyalty review", start: new Date("2026-07-15T14:00:00"), end: new Date("2026-07-15T15:00:00") },
]);

const selectedReview = ref<ISchedulerEvent | null>(null);

function onEventUpdate(u: { id: string; start: Date; end: Date; title?: string; allDay?: boolean; color?: string }) {
  const review = reviews.value.find((r) => r.id === u.id);
  if (review) Object.assign(review, u);
}
</script>
```

## Common Mistakes

### 1. Passing `isEventEditable` as a value instead of a getter function

```vue
<!-- WRONG: evaluates once, becomes a static boolean-ish value -->
<VcScheduler :is-event-editable="someEvent.editable" ... />

<!-- CORRECT: pass a function; it is called per-event and re-evaluated on every interaction -->
<VcScheduler :is-event-editable="(e) => e.meta?.locked !== true" ... />
```

### 2. Using a light CSS-variable event color

Bar/label ink is chosen automatically from the fill's luminance (near-white or near-black, whichever gives higher WCAG contrast), so a **hex** `color` — light or dark — always gets a legible label. The one gap: a **CSS-variable** fill (e.g. `var(--primary-300)`) can't be measured at runtime, so it falls back to white ink; a light var then fails contrast. Past events render as a pale tint of the fill with dark text (also AA), so this only affects live events with a light var fill.

```vue
<!-- WRONG: a light CSS-var fill can't be measured, falls back to white ink -->
<script setup>
const events = [{ id: "a", title: "Promo", start, end, allDay: true, color: "var(--primary-300)" }];
</script>

<!-- CORRECT: use a hex (auto ink handles it), a dark var, or omit color for the auto palette. -->
<script setup>
const events = [{ id: "a", title: "Promo", start, end, allDay: true, color: "#a21caf" }];
</script>
```

### 3. Using `view`/`date` as one-way props and expecting the toolbar to work

```vue
<!-- WRONG: :view/:date without v-model -- the toolbar's prev/next/today and
     view-switch controls emit update:view/update:date, but nothing listens -->
<VcScheduler :view="view" :date="date" :events="events" />

<!-- CORRECT -->
<VcScheduler v-model:view="view" v-model:date="date" :events="events" />
```

### 4. Forgetting to give the container a height

```vue
<!-- WRONG: no height -- the grid/scroll container collapses to 0px -->
<VcScheduler :events="events" />

<!-- CORRECT: wrap in (or size) a container with an explicit height -->
<div style="height: 640px">
  <VcScheduler :events="events" />
</div>
```

## Accessibility

- The Month grid uses `role="grid"` / `role="row"` / `role="gridcell"` / `role="columnheader"` for the weekday header and day cells, each `gridcell` carrying a full formatted-date `aria-label`.
- Each event bar and timed chip is a focusable `role="button"` element (`tabindex="0"`) with an `aria-label` built from its title and formatted start/end dates -- activate with click or `Enter`. For an all-day event the announced end is the **last inclusive day**, not the exclusive `end` you pass: an event with `end` at midnight runs through the previous day, so a one-day event is announced as a single date rather than a two-day range. Timed events are announced with their real times.
- The "+N more" overflow control is a `<button>` whose visible text is its accessible name; the date it belongs to comes from the enclosing `gridcell`. Activating it moves focus to the first event in the popover, and closing the popover (Escape, or the close button) returns focus to the "+N more" button. Each event inside the popover is a `<button>` too, so a day's 4th and later events are reachable and operable by keyboard.
- The overflow popover's panel is a `VcPopover`, which supplies a titled header (the formatted date) and Escape-to-close. It does **not** apply `role="dialog"` or trap focus -- `VcPopover` has no focus management of its own, so any popover-based surface that needs focus moved into it does that itself, as the overflow popover above does.
- The editor modal and the This event/All events scope dialog are `VcPopup`, which is a Headless UI `Dialog` -- those do get accessible naming, a focus trap, focus restore and `inert` on the background from the library. The built-in quick-create popover is a `VcPopover` and focuses its title field on open.
- The recurrence editor's weekday toggle buttons expose `aria-pressed` (selected state) and an `aria-label` with the full weekday name, since their visible narrow labels ("S", "M", "T", ...) collide (Sun/Sat, Tue/Thu). The "↻" recurring-occurrence marker is `aria-hidden` -- purely visual, redundant with the event's own accessible name.
- The toolbar's prev/next buttons carry an explicit `aria-label` ("Previous" / "Next") since they are icon-only; the today/view-switch buttons show text labels.
- Event move/resize (Month view's `editable`) is a pointer-drag interaction with no keyboard equivalent yet; use a form outside VcScheduler for keyboard-only date edits. Timeline view is read-only (click still opens the quick-info popover).
- Respects `prefers-reduced-motion` -- event/bar transitions and chip hover transitions are disabled.

## Related Components

- [VcDataTable](../vc-data-table/) -- for tabular (non-calendar) views of the same periods.
- [VcGallery](../vc-gallery/) -- another organism with drag interaction, for image reordering rather than time-based events.
