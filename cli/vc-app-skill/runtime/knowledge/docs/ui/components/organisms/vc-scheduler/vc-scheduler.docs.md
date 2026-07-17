---
title: VcScheduler
category: components
group: data-display
---

# VcScheduler

A calendar organism for planning date-bound periods -- promotions, pricelist windows, campaigns. It defaults to a Month grid where all-day events render as bars (stacking into lanes when they overlap, with a "+N more" overflow popover) and shorter events render as timed chips. It can also switch to a resource-by-time Timeline view.

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

function onEventUpdate(u: { id: string; start: Date; end: Date }) {
  const event = events.value.find((e) => e.id === u.id);
  if (event) {
    event.start = u.start;
    event.end = u.end;
  }
}

function onEventCreate(c: { start: Date; end: Date; allDay: boolean }) {
  events.value.push({ id: crypto.randomUUID(), title: "New event", ...c });
}
</script>
```

`VcScheduler` needs an explicit height from its parent -- it fills `height: 100%` internally but does not impose one of its own.

## Table of Contents

1. [Views](#views)
2. [Event Model](#event-model)
3. [Editable Events](#editable-events)
4. [Overlapping Events and Overflow](#overlapping-events-and-overflow)
5. [Custom Slots](#custom-slots)
6. [Timeline View](#timeline-view)
7. [Props](#props)
8. [Events](#events)
9. [Slots](#slots)
10. [CSS Custom Properties](#css-custom-properties)
11. [Recipes](#recipes)
12. [Common Mistakes](#common-mistakes)
13. [Accessibility](#accessibility)
14. [Related Components](#related-components)

---

## Views

`view` selects the active calendar view and defaults to `"month"`. Bind it with `v-model:view` so the built-in toolbar's view switcher stays in sync with your state:

```vue
<VcScheduler v-model:view="view" v-model:date="date" :events="events" />
```

| View         | Data props          | Description                                                                                |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------ |
| `"month"`    | `events`            | Default. A 6-week grid; all-day events as bars, short events as chips.                     |
| `"timeline"` | `resources`, `bars` | Resource rows with date-bound bars packed into lanes. See [Timeline View](#timeline-view). |

`date` is the focused date (which month is shown, or the timeline anchor). Bind it with `v-model:date` so the toolbar's prev/next/today controls update your state:

```vue
<VcScheduler v-model:date="date" :events="events" />
```

Both view and data props are independent -- passing `resources`/`bars` while `view` is (or defaults to) `"month"` renders nothing from them, and vice versa. See [Common Mistakes](#common-mistakes).

## Event Model

```ts
interface ISchedulerEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  /** Forces bar (true) or chip (false) rendering. Inferred from duration when omitted. */
  allDay?: boolean;
  /** CSS color or CSS var() reference; defaults to var(--primary-500). */
  color?: string;
  /** Per-event override of the global `editable` prop. */
  editable?: boolean;
  /** Free-form data for custom slots/handlers. */
  meta?: Record<string, unknown>;
}
```

An event renders as a full-width **bar** spanning its day columns when `allDay` is `true`, or when omitted and `end - start >= 24h`. Anything shorter renders as a compact **chip** showing `HH:mm` plus the title, listed under its day cell.

## Editable Events

Set `editable` to allow drag-to-move and drag-to-resize on event bars in Month view, plus drag-to-create by pointer-dragging across empty day cells (commits via `event-create`). Moves and resizes commit on pointer-up via `event-update`.

```vue
<VcScheduler v-model:date="date" :events="events" editable @event-update="onEventUpdate" @event-create="onEventCreate" />
```

To make only _some_ events editable, use `isEventEditable` -- it is re-evaluated on every render, so an inline arrow function is safe:

```vue
<VcScheduler :events="events" editable :is-event-editable="(e) => e.meta?.locked !== true" />
```

An event can also opt out individually via its own `editable: false` field, independent of the global prop.

## Overlapping Events and Overflow

All-day events that overlap in time on the same days are packed into separate stacked lanes automatically -- no configuration needed. When a day would need more lanes than fit, the extra events collapse into a "+N more" link; clicking it opens a popover listing every all-day event on that date.

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

Timeline view has its own set of slots (`resource`, `bar`, `header-cell`, `empty`) -- see [Timeline View](#timeline-view).

## Timeline View

Set `view="timeline"` and pass `resources`/`bars` (instead of `events`) to render a resource-by-time timeline: each resource is a row, and bars are periods placed on it via `bar.resourceId`. Overlapping bars on the same resource pack into stacked lanes, the same way Month-view events do.

```ts
interface ISchedulerResource {
  id: string;
  label: string;
  meta?: Record<string, unknown>;
}

interface ISchedulerBar {
  id: string;
  resourceId: string;
  start: Date;
  end: Date;
  label?: string;
  /** CSS color or CSS var() reference; defaults to var(--primary-500). */
  color?: string;
  /** Per-bar override of the global `editable` prop. */
  editable?: boolean;
}
```

`zoom` controls tick granularity (`"hour" | "day" | "week" | "month" | "quarter" | "year"`, fine to coarse) -- bind with `v-model:zoom` so the toolbar's zoom in/out buttons stay in sync. `range` is the visible date window; when omitted it derives from the min/max span of `bars`, or `[now, now + 30 days]` when empty. `snap` (milliseconds, or `"auto"`) controls the drag/resize snap step, and `isBarEditable` is the per-bar analog of `isEventEditable`.

Timeline-only slots: `resource` (`{ resource }`, replaces a resource-panel cell), `bar` (`{ bar }`, replaces bar content), `header-cell` (`{ tick }`, replaces a fine-tick header cell), `empty` (replaces the empty-state shown when `bars` is empty).

See the [Timeline recipe](#timeline-promotions-with-per-pricelist-lock) below for a full example.

## Props

| Prop              | Type                              | Default      | Description                                                                 |
| ----------------- | --------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `events`          | `ISchedulerEvent[]`               | `[]`         | Month view. Events to render.                                               |
| `view`            | `SchedulerView`                   | `"month"`    | Active view (`"month"` \| `"timeline"`). Bind with `v-model:view`.          |
| `date`            | `Date`                            | `new Date()` | Focused date. Bind with `v-model:date`.                                     |
| `editable`        | `boolean`                         | `false`      | Enables drag-to-move / drag-to-resize (and, in Month view, drag-to-create). |
| `firstDayOfWeek`  | `number`                          | `1`          | First column of the Month grid (0 = Sunday, 1 = Monday).                    |
| `isEventEditable` | `(e: ISchedulerEvent) => boolean` | `undefined`  | Month view. Per-event override of `editable`. Re-evaluated every render.    |
| `resources`       | `ISchedulerResource[]`            | `[]`         | Timeline view. Rows of the timeline.                                        |
| `bars`            | `ISchedulerBar[]`                 | `[]`         | Timeline view. Periods placed on the timeline via `bar.resourceId`.         |
| `zoom`            | `SchedulerZoom`                   | `"day"`      | Timeline view. Tick granularity. Bind with `v-model:zoom`.                  |
| `range`           | `{ start: Date; end: Date }`      | auto-derived | Timeline view. Visible date window.                                         |
| `snap`            | `number \| "auto"`                | `"auto"`     | Timeline view. Snap step in milliseconds for drag/resize.                   |
| `isBarEditable`   | `(bar: ISchedulerBar) => boolean` | `undefined`  | Timeline view. Per-bar override of `editable`. Re-evaluated every render.   |
| `resourceWidth`   | `number \| undefined`             | `200`        | Timeline view. Width in pixels of the left resource panel.                  |
| `barMinWidth`     | `number \| undefined`             | `undefined`  | Timeline view. Reserved for future use.                                     |

## Events

| Event          | Payload                                       | Description                                                                      |
| -------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| `update:view`  | `SchedulerView`                               | Fires when the toolbar's view switcher changes the active view.                  |
| `update:date`  | `Date`                                        | Fires when the toolbar's prev/next/today controls change the focused date.       |
| `event-click`  | `ISchedulerEvent`                             | Month view. Fires when an event bar or chip is activated (click or Enter).       |
| `event-create` | `{ start: Date; end: Date; allDay: boolean }` | Month view. Fires when a drag-to-create gesture is committed.                    |
| `event-update` | `{ id: string; start: Date; end: Date }`      | Month view. Fires after a drag-move or drag-resize is committed.                 |
| `bar-click`    | `ISchedulerBar`                               | Timeline view. Fires when a bar is activated (click or Enter).                   |
| `bar-select`   | `ISchedulerBar \| null`                       | Timeline view. Fires on selection change; `null` when cleared.                   |
| `bar-update`   | `IBarUpdate` (`{ id, start, end }`)           | Timeline view. Fires after a drag-move or drag-resize is committed.              |
| `bar-create`   | `IBarCreate` (`{ resourceId, start, end }`)   | Timeline view. Fires from the mobile agenda's inline "+" action.                 |
| `bar-delete`   | `{ id: string }`                              | Timeline view. Fires when Delete is tapped in the mobile bar-edit sheet.         |
| `update:zoom`  | `SchedulerZoom`                               | Timeline view. Fires when the toolbar zoom in/out buttons change the zoom level. |
| `range-change` | `{ start: Date; end: Date }`                  | Timeline view. Fires on horizontal scroll with the currently visible date range. |

## Slots

| Slot          | Scope             | Description                                                               |
| ------------- | ----------------- | ------------------------------------------------------------------------- |
| `event`       | `{ event }`       | Month view. Replaces an event's inner content. Defaults to `event.title`. |
| `toolbar`     | `{ title, view }` | Replaces the entire built-in toolbar.                                     |
| `resource`    | `{ resource }`    | Timeline view. Replaces a resource-panel cell's content.                  |
| `bar`         | `{ bar }`         | Timeline view. Replaces a bar's inner content.                            |
| `header-cell` | `{ tick }`        | Timeline view. Replaces a fine-tick header cell's content.                |
| `empty`       | --                | Timeline view. Replaces the empty-state shown when `bars` is empty.       |

## CSS Custom Properties

| Property                   | Default               | Description                                                            |
| -------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `--scheduler-border-color` | `var(--neutrals-200)` | Border color for the grid, header, resource panel, and row separators. |
| `--vc-scheduler-event-ink` | `#fff`                | Text color on Month-view event bars/chips.                             |
| `--z-critical-popup`       | (theme z-index scale) | Stacking context for the "+N more" overflow popover.                   |
| `--z-local-sticky`         | (theme z-index scale) | Timeline view. Stacking context for the sticky resource panel.         |
| `--z-critical-modal`       | (theme z-index scale) | Timeline view. Stacking context for the mobile bottom-sheet editor.    |

Event/bar fill color comes from `color` (any CSS color or `var(...)` reference) and defaults to `var(--primary-500)`. Bar/chip label text is white by default -- see [Common Mistakes](#common-mistakes).

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

function onEventUpdate(u: { id: string; start: Date; end: Date }) {
  const promo = promotions.value.find((p) => p.id === u.id);
  if (promo) {
    promo.start = u.start;
    promo.end = u.end;
  }
}

function onEventCreate(c: { start: Date; end: Date; allDay: boolean }) {
  promotions.value.push({ id: crypto.randomUUID(), title: "New promotion", ...c });
}
</script>
```

### Timeline: promotions with per-pricelist lock

```vue
<template>
  <div style="height: 500px">
    <VcScheduler
      view="timeline"
      :resources="pricelists"
      :bars="promotions"
      v-model:zoom="zoom"
      editable
      :is-bar-editable="(bar) => !lockedPricelistIds.has(bar.resourceId)"
      @bar-update="onBarUpdate"
      @bar-select="(bar) => (selectedPromotion = bar)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcScheduler } from "@vc-shell/framework";
import type { ISchedulerResource, ISchedulerBar, SchedulerZoom, IBarUpdate } from "@vc-shell/framework";

const pricelists: ISchedulerResource[] = [
  { id: "pl-summer", label: "Summer Pricelist" },
  { id: "pl-loyalty", label: "Loyalty Pricelist" },
  { id: "pl-clearance", label: "Clearance" },
];

const promotions = ref<ISchedulerBar[]>([
  { id: "b1", resourceId: "pl-summer", start: new Date("2026-07-01"), end: new Date("2026-07-14"), label: "Summer Sale" },
  { id: "b2", resourceId: "pl-loyalty", start: new Date("2026-07-01"), end: new Date("2026-07-31"), label: "July Prices" },
]);

const lockedPricelistIds = new Set(["pl-clearance"]);
const zoom = ref<SchedulerZoom>("week");
const selectedPromotion = ref<ISchedulerBar | null>(null);

function onBarUpdate(u: IBarUpdate) {
  const promo = promotions.value.find((p) => p.id === u.id);
  if (promo) {
    promo.start = u.start;
    promo.end = u.end;
  }
}
</script>
```

## Common Mistakes

### 1. Forgetting `view="timeline"` -- `resources`/`bars` render nothing

`view` defaults to `"month"`, which only reads `events`. If you're migrating existing `resources`/`bars` usage (or copying an old timeline example), the grid renders empty unless you set the view explicitly.

```vue
<!-- WRONG: view defaults to "month", so resources/bars are silently ignored -->
<VcScheduler :resources="resources" :bars="bars" />

<!-- CORRECT -->
<VcScheduler view="timeline" :resources="resources" :bars="bars" />
```

### 2. Passing `isEventEditable`/`isBarEditable` as a value instead of a getter function

```vue
<!-- WRONG: evaluates once, becomes a static boolean-ish value -->
<VcScheduler :is-event-editable="someEvent.editable" ... />

<!-- CORRECT: pass a function; it is called per-event and re-evaluated on every interaction -->
<VcScheduler :is-event-editable="(e) => e.meta?.locked !== true" ... />
```

### 3. Using a light event color and failing color contrast

Event/bar labels default to white text (`--vc-scheduler-event-ink`, `#fff`). A light `color` fails readability with white text. Contrast is a **manual design responsibility** -- the `color-contrast` a11y rule is disabled repo-wide, so a poor color choice won't be caught automatically.

```vue
<!-- WRONG: light tint, white text on it fails 4.5:1 contrast -->
<script setup>
const events = [{ id: "a", title: "Promo", start, end, allDay: true, color: "var(--primary-300)" }];
</script>

<!-- CORRECT: use a dark color, e.g. var(--primary-600), var(--primary-700), or var(--accent-600). Or omit color to use the default var(--primary-500). -->
<script setup>
const events = [{ id: "a", title: "Promo", start, end, allDay: true, color: "var(--primary-600)" }];
</script>
```

### 4. Using `view`/`date` as one-way props and expecting the toolbar to work

```vue
<!-- WRONG: :view/:date without v-model -- the toolbar's prev/next/today and
     view-switch controls emit update:view/update:date, but nothing listens -->
<VcScheduler :view="view" :date="date" :events="events" />

<!-- CORRECT -->
<VcScheduler v-model:view="view" v-model:date="date" :events="events" />
```

### 5. Forgetting to give the container a height

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
- Each event bar and timed chip is a focusable `role="button"` element (`tabindex="0"`) with an `aria-label` built from its title and formatted start/end dates -- activate with click or `Enter`.
- The "+N more" overflow popover uses `role="dialog"` with an `aria-label` set to the formatted date.
- The toolbar's prev/next buttons carry an explicit `aria-label` ("Previous" / "Next") since they are icon-only; the today/view-switch buttons show text labels.
- Event move/resize (and Timeline bar move/resize) is a pointer-drag interaction with no keyboard equivalent yet; use a form outside VcScheduler for keyboard-only date edits.
- Respects `prefers-reduced-motion` -- event/bar transitions and chip hover transitions are disabled.

## Related Components

- [VcDataTable](../vc-data-table/) -- for tabular (non-calendar) views of the same periods.
- [VcDatePicker](../../molecules/vc-date-picker/) -- used internally by the Timeline mobile bottom-sheet editor for date-range input.
- [VcGallery](../vc-gallery/) -- another organism with drag interaction, for image reordering rather than time-based events.
