import { ref, provide } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { IsMobileKey } from "@framework/injection-keys";
import { VcScheduler } from "./index";
import type { ISchedulerEvent, SchedulerView } from "./types";

const day = (d: string) => new Date(`2026-${d}T00:00:00Z`);

// Realistic promo/pricelist events for the "July 2026" default month.
//
// Bar/event colors default to var(--primary-500). Any custom `color` MUST stay
// dark enough for the always-white event label to clear 4.5:1 contrast -- use
// var(--primary-600)/var(--primary-700)/var(--accent-600), never a light 300/400
// tint. The repo disables the axe color-contrast rule, so a bad choice here
// will NOT be auto-caught. See "Common Mistakes" in vc-scheduler.docs.md.
const events: ISchedulerEvent[] = [
  { id: "e1", title: "Summer Sale", start: day("07-01"), end: day("07-06"), allDay: true },
  {
    id: "e2",
    title: "Flash Deal",
    start: day("07-10"),
    end: day("07-13"),
    allDay: true,
  },
  {
    id: "e3",
    title: "Loyalty pricing review",
    start: new Date("2026-07-15T09:00:00Z"),
    end: new Date("2026-07-15T10:00:00Z"),
  },
  {
    id: "e4",
    title: "Clearance walkthrough",
    start: new Date("2026-07-15T13:30:00Z"),
    end: new Date("2026-07-15T14:00:00Z"),
  },
  { id: "e5", title: "Back to School Promo", start: day("07-20"), end: day("07-25"), allDay: true },
];

// Timed events shared by the `TimedEvents` story and the Timeline Day/Week stories --
// dated on 2021-01-13 (plus neighbouring days so Timeline Week has more than one day
// of content). Kept on hour boundaries so bars land cleanly under the timeline's hour
// header columns.
const timedEvents: ISchedulerEvent[] = [
  {
    id: "t1",
    title: "Pricing sync",
    start: new Date(2021, 0, 13, 9, 0),
    end: new Date(2021, 0, 13, 10, 0),
  },
  {
    id: "t2",
    title: "Loyalty review",
    start: new Date(2021, 0, 13, 11, 0),
    end: new Date(2021, 0, 13, 11, 45),
  },
  {
    id: "t3",
    title: "Clearance walkthrough",
    start: new Date(2021, 0, 13, 14, 0),
    end: new Date(2021, 0, 13, 14, 30),
  },
  {
    id: "t4",
    title: "Morning stand-up",
    start: new Date(2021, 0, 12, 9, 0),
    end: new Date(2021, 0, 12, 9, 30),
  },
  {
    id: "t5",
    title: "Next-day retro",
    start: new Date(2021, 0, 14, 10, 0),
    end: new Date(2021, 0, 14, 10, 30),
  },
];

// Recurring-events fixture for the `RecurringEvents` story: a weekly master (Mon/Wed/Fri,
// 8 occurrences starting Jul 1 2026, a Wednesday) plus one override and one skipped day, so
// occurrences, an override, and a gap are all visible at once:
//   Jul 1 (We), 3 (Fr), 6 (Mo), 8 (We, skipped), 10 (Fr), 13 (Mo, overridden), 15 (We), 17 (Fr)
const recurringEvents: ISchedulerEvent[] = [
  {
    id: "rec-master",
    title: "Weekly Pricing Sync",
    start: new Date(2026, 6, 1, 9, 0),
    end: new Date(2026, 6, 1, 10, 0),
    recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=8",
    // Jul 8's occurrence is skipped entirely -- no bar/chip renders that day.
    exceptionDates: [new Date(2026, 6, 8, 9, 0)],
  },
  {
    id: "rec-override-1",
    title: "Pricing Sync (moved to afternoon)",
    start: new Date(2026, 6, 13, 14, 0),
    end: new Date(2026, 6, 13, 15, 0),
    // Replaces the synthesized Jul 13 09:00 occurrence -- same series, different time/title.
    recurrenceId: "rec-master",
    originalStart: new Date(2026, 6, 13, 9, 0),
  },
];

// Multi-day recurring series. The master spans several days, and the expansion
// preserves that duration for every occurrence -- so each occurrence renders as
// a bar that stretches across the same number of days:
//   - "Weekend Flash Sale": all-day, Fri->Sun (3 days), every Friday x4.
//   - "Quarterly Stocktake": timed, Tue 08:00 -> Thu 17:00 (spans 3 days),
//     every 2 weeks x3, showing multi-day works for timed events too.
const recurringMultiDay: ISchedulerEvent[] = [
  {
    id: "rec-md-sale",
    title: "Weekend Flash Sale",
    start: new Date(2026, 6, 3, 0, 0),
    end: new Date(2026, 6, 6, 0, 0), // exclusive end -> covers Fri 3, Sat 4, Sun 5
    allDay: true,
    recurrence: "FREQ=WEEKLY;BYDAY=FR;COUNT=4",
  },
  {
    id: "rec-md-stocktake",
    title: "Quarterly Stocktake",
    start: new Date(2026, 6, 7, 8, 0),
    end: new Date(2026, 6, 9, 17, 0), // Tue 08:00 -> Thu 17:00, spans 3 days
    recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=3",
  },
];

/**
 * `VcScheduler` is an organism for planning date-bound periods (promotions,
 * pricelist windows, campaigns) on a calendar. It defaults to a **Month**
 * grid view and can switch to a **Timeline** view (the same events on a
 * vertical time grid, hours down the Y axis) via `view="timeline-day"` /
 * `"timeline-week"`.
 *
 * Month view lays out all-day events as bars spanning their day columns
 * (stacking into lanes when they overlap, with a "+N more" overflow popover),
 * and timed events as small time-labelled chips. Both `view` and `date` are
 * two-way bound (`v-model:view`, `v-model:date`) so the built-in toolbar's
 * prev/next/today and view-switch controls stay in sync with your state.
 */
const meta = {
  title: "Data Display/VcScheduler",
  component: VcScheduler,
  tags: ["autodocs"],
  argTypes: {
    // -- Data --
    events: {
      description:
        "Events to render in Month view. All-day events (or those spanning >= 1 day) render as bars; shorter events render as timed chips.",
      table: { type: { summary: "ISchedulerEvent[]" }, category: "Data" },
    },
    // -- Model --
    view: {
      description: "Active view. Use `v-model:view` so the toolbar's view switcher stays in sync.",
      control: "select",
      options: ["month", "timeline-day", "timeline-week"],
      table: { type: { summary: "SchedulerView" }, defaultValue: { summary: '"month"' }, category: "Model" },
    },
    date: {
      description: "Focused date -- the month (or timeline anchor) currently shown. Use `v-model:date`.",
      table: { type: { summary: "Date" }, defaultValue: { summary: "new Date()" }, category: "Model" },
    },
    // -- State --
    editable: {
      description: "Enables drag-to-move / drag-to-resize on events (Month) or bars (Timeline).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" }, category: "State" },
    },
    quickInfo: {
      description:
        "Month view. Opens a built-in quick-info popover (title, date range, Edit/Delete) when an event bar or chip is clicked. Disable for a fully custom click flow -- `event-click` still always fires.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" }, category: "State" },
    },
    // -- Config --
    firstDayOfWeek: {
      description: "First column of the Month grid: 0 = Sunday, 1 = Monday (ISO default).",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "1" }, category: "Config" },
    },
    // -- Behavior --
    isEventEditable: {
      description:
        "Per-event override of `editable`. Re-evaluated on every render -- safe to pass an inline arrow function.",
      table: { type: { summary: "(e: ISchedulerEvent) => boolean" }, category: "Behavior" },
    },
    editorMode: {
      description:
        '"builtin" (default) opens the quick-create popover / editor modal for create and edit intents. "emit" skips the built-in UI and re-emits the intent as `event-create` (empty title) / `event-edit` instead, for hosts driving their own create/edit flow.',
      control: "select",
      options: ["builtin", "emit"],
      table: {
        type: { summary: '"builtin" | "emit"' },
        defaultValue: { summary: '"builtin"' },
        category: "Behavior",
      },
    },
    // -- Events --
    "onUpdate:view": {
      description: "Fires when the toolbar's view switcher changes the active view.",
      action: "update:view",
      table: { type: { summary: "(v: SchedulerView) => void" }, category: "Events" },
    },
    "onUpdate:date": {
      description: "Fires when the toolbar's prev/next/today controls change the focused date.",
      action: "update:date",
      table: { type: { summary: "(d: Date) => void" }, category: "Events" },
    },
    "onEvent-click": {
      description: "Month view. Fires when an event bar or timed chip is activated (click or Enter).",
      action: "event-click",
      table: { type: { summary: "(e: ISchedulerEvent) => void" }, category: "Events" },
    },
    "onEvent-create": {
      description:
        'Fires when the quick-create popover or the editor modal (create mode) is saved, in any view. Also fires directly (empty title, no UI) when `editorMode` is "emit".',
      action: "event-create",
      table: {
        type: { summary: "(c: { start: Date; end: Date; allDay: boolean; title: string; color?: string }) => void" },
        category: "Events",
      },
    },
    "onEvent-update": {
      description:
        "Fires after a drag-move/drag-resize commits, or the editor modal (edit mode) is saved, in any view.",
      action: "event-update",
      table: {
        type: {
          summary:
            "(u: { id: string; start: Date; end: Date; title?: string; allDay?: boolean; color?: string }) => void",
        },
        category: "Events",
      },
    },
    "onEvent-edit": {
      description:
        'Only fires when `editorMode` is "emit": fires when the quick-info popover\'s "Edit" button is clicked, instead of opening the built-in editor modal.',
      action: "event-edit",
      table: { type: { summary: "(e: ISchedulerEvent) => void" }, category: "Events" },
    },
    "onEvent-delete": {
      description:
        'Fires when the quick-info popover\'s "Delete" button, or the editor modal\'s "Delete" button, is clicked.',
      action: "event-delete",
      table: { type: { summary: "(p: { id: string }) => void" }, category: "Events" },
    },
    // -- Slots --
    event: {
      description: "Month view. Overrides event content. Receives `{ event }`. Defaults to `event.title`.",
      table: { type: { summary: '#event="{ event }"' }, category: "Slots" },
    },
    toolbar: {
      description: "Overrides the entire built-in toolbar. Receives `{ title, view }`.",
      table: { type: { summary: '#toolbar="{ title, view }"' }, category: "Slots" },
    },
    resource: {
      description: "Timeline-only. Overrides resource-panel cell content. Receives `{ resource }`.",
      table: { type: { summary: '#resource="{ resource }"' }, category: "Slots" },
    },
    bar: {
      description: "Timeline-only. Overrides bar content. Receives `{ bar }`.",
      table: { type: { summary: '#bar="{ bar }"' }, category: "Slots" },
    },
    "event-popover": {
      description:
        "Month view. Overrides the built-in quick-info popover content. Receives `{ event, close }`. Defaults to title, date range, and Edit/Delete buttons.",
      table: { type: { summary: '#event-popover="{ event, close }"' }, category: "Slots" },
    },
    "quick-create": {
      description:
        "Overrides the built-in quick-create popover. Receives `{ open, anchorRect, draft, save, more, close }` -- call `save({ title })` to commit, `more({ title })` to hand off to your own editor.",
      table: { type: { summary: '#quick-create="{ open, anchorRect, draft, save, more, close }"' }, category: "Slots" },
    },
    "event-editor": {
      description:
        'Overrides the built-in editor modal. Receives `{ open, mode, draft, save, delete, close }` -- `mode` is "create" | "edit"; call `save(draft)` to commit, `delete({ id })` to remove.',
      table: { type: { summary: '#event-editor="{ open, mode, draft, save, delete, close }"' }, category: "Slots" },
    },
  },
  args: {
    events,
    view: "month",
    date: day("07-15"),
    editable: true,
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        component: `
VcScheduler is a calendar organism for planning date-bound events (promotions, pricelist
windows, campaigns). It defaults to a Month grid and can switch to a resource-by-time
Timeline view.

\`\`\`vue
<VcScheduler
  v-model:view="view"
  v-model:date="date"
  :events="events"
  editable
  @event-update="onEventUpdate"
/>
\`\`\`
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcScheduler },
    setup: () => ({ args }),
    template: '<div style="height:640px"><VcScheduler v-bind="args" /></div>',
  }),
} satisfies Meta<typeof VcScheduler>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Stateful helper --
//
// The plain `args`-bound render below is fine for static scenario stories, but it
// leaves `date`/`view`/`events` frozen -- prev/next/today, drag-move, and
// drag-to-create have nothing to write into. This factory wires local refs so the
// controls actually move the calendar, in addition to the Storybook action logger
// (both fire: v-bind="args" contributes the `onEvent-*` action handlers, and the
// explicit listeners below layer the local state mutation on top).
function renderInteractive(args: Record<string, unknown>) {
  return {
    components: { VcScheduler },
    setup() {
      const date = ref((args.date as Date) ?? new Date());
      const view = ref((args.view as SchedulerView) ?? "month");
      const events = ref(((args.events as ISchedulerEvent[]) ?? []).map((e) => ({ ...e })));

      // Update payload from a drag-move/resize omits title/allDay/color; from the editor's
      // save (edit mode) it carries all of them. The recurrence fields are only ever set by
      // the scope-dialog "All events" edit (recurrence) or the "This event" delete path
      // (exceptionDates) -- merge whatever is present onto the event, matched by id, which
      // covers plain events, recurring masters, and single-occurrence overrides alike.
      function onEventUpdate(u: {
        id: string;
        start: Date;
        end: Date;
        title?: string;
        allDay?: boolean;
        color?: string;
        recurrence?: string;
        exceptionDates?: Date[];
        recurrenceId?: string;
        originalStart?: Date;
      }) {
        const idx = events.value.findIndex((e) => e.id === u.id);
        if (idx !== -1) events.value[idx] = { ...events.value[idx], ...u };
      }
      // Create payload always carries the title the user typed (quick-create popover or
      // editor modal) -- push it straight onto the list, no placeholder title needed. When
      // `recurrenceId` is set this is a single-occurrence override (scope-dialog "This event"
      // edit of an occurrence with no override yet); when `recurrence` is set instead, it's a
      // brand-new recurring master.
      function onEventCreate(c: {
        start: Date;
        end: Date;
        allDay: boolean;
        title: string;
        color?: string;
        recurrence?: string;
        recurrenceId?: string;
        originalStart?: Date;
      }) {
        events.value.push({ id: `new-${Date.now()}`, ...c });
      }
      function onEventDelete(p: { id: string }) {
        events.value = events.value.filter((e) => e.id !== p.id);
      }

      return { args, date, view, events, onEventUpdate, onEventCreate, onEventDelete };
    },
    // NOTE: bind props explicitly (not v-bind="args") — Storybook injects auto-action
    // listeners (onEventUpdate, ...) into `args`, which clobber the explicit @event-* handlers
    // below, so a spread would silently swallow the state mutations and the demo would look inert.
    template: `<div style="height:640px">
      <VcScheduler
        v-model:date="date"
        v-model:view="view"
        :views="args.views"
        :events="events"
        :editable="args.editable"
        :quick-info="args.quickInfo"
        :first-day-of-week="args.firstDayOfWeek"
        @event-update="onEventUpdate"
        @event-create="onEventCreate"
        @event-delete="onEventDelete"
      />
    </div>`,
  };
}

// Mirrors renderInteractive but forces the mobile breakpoint (IsMobileKey) and a
// phone-width frame, so the Month view renders as the vertical agenda list.
function renderMobileAgenda(args: Record<string, unknown>) {
  const base = renderInteractive(args);
  const innerSetup = base.setup;
  return {
    ...base,
    setup() {
      provide(IsMobileKey, ref(true));
      return innerSetup();
    },
    template: `<div style="height:720px;max-width:390px;margin:0 auto;border:1px solid var(--neutrals-200)">${base.template.replace('<div style="height:640px">', '<div style="height:100%">')}</div>`,
  };
}

// -- Core states --

/**
 * Default Month view: editable, a mix of all-day event bars and timed chips. Fully
 * stateful -- prev/next/today navigate, drag moves events, and clicking an event opens
 * the quick-info popover. Since `editable` is on, empty cells are also live: single-click
 * opens the quick-create popover, double-click/drag opens the editor modal -- see the
 * `EditingFlow` story below for the full interaction map.
 */
export const Default: Story = {
  render: renderInteractive,
};

/** With `editable: false`, events cannot be dragged or resized, but remain clickable. */
export const ReadOnly: Story = {
  args: { editable: false },
  parameters: {
    docs: {
      description: {
        story: "Read-only Month view -- events are still selectable/clickable but cannot be moved or resized.",
      },
    },
  },
};

// -- Feature stories --

/** All-day events that span several days (and, in the first row, past a week boundary) render as continuous bars with continuation arrows. */
export const MultiDayEvents: Story = {
  args: {
    date: day("07-15"),
    events: [
      { id: "m1", title: "Quarter-long Clearance", start: day("06-28"), end: day("07-04"), allDay: true },
      { id: "m2", title: "Mid-Summer Sale", start: day("07-08"), end: day("07-16"), allDay: true },
      { id: "m3", title: "End-of-Month Promo", start: day("07-27"), end: day("08-06"), allDay: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-day events are clipped per week row; a bar that continues into the previous/next row shows a "‹"/"›" continuation arrow instead of a rounded end.',
      },
    },
  },
};

/** Three overlapping all-day events on the same days pack into three stacked lanes. */
export const OverlappingLanes: Story = {
  args: {
    date: day("07-15"),
    events: [
      { id: "o1", title: "Summer Sale", start: day("07-05"), end: day("07-15"), allDay: true },
      {
        id: "o2",
        title: "Loyalty Bonus",
        start: day("07-08"),
        end: day("07-18"),
        allDay: true,
      },
      {
        id: "o3",
        title: "Clearance",
        start: day("07-10"),
        end: day("07-20"),
        allDay: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Events that overlap in time on the same days are packed into separate lanes instead of overlapping visually.",
      },
    },
  },
};

/** Timed (non-all-day) events under 24h render as compact time-labelled chips rather than full-width bars. */
export const TimedEvents: Story = {
  args: {
    date: new Date(2021, 0, 13),
    events: timedEvents,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Timed events (explicit `allDay: false`, or any span under 24h) render as small chips showing `HH:mm` plus the title.",
      },
    },
  },
};

/** Four overlapping all-day events exceed the default 3-lane cap, so the fourth collapses into a "+1 more" overflow link opening a popover. */
export const MoreOverflow: Story = {
  args: {
    date: day("07-15"),
    events: [
      { id: "f1", title: "Summer Sale", start: day("07-13"), end: day("07-17"), allDay: true },
      {
        id: "f2",
        title: "Flash Deal",
        start: day("07-13"),
        end: day("07-17"),
        allDay: true,
      },
      {
        id: "f3",
        title: "Loyalty Bonus",
        start: day("07-13"),
        end: day("07-17"),
        allDay: true,
      },
      { id: "f4", title: "Clearance", start: day("07-13"), end: day("07-17"), allDay: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Only 3 lanes render inline; the rest collapse into a "+N more" link per day that opens a popover listing every all-day event on that date.',
      },
    },
  },
};

/** `date` set to today so the current day cell is visually highlighted. */
export const TodayHighlight: Story = {
  args: {
    date: new Date(),
    events: [
      {
        id: "td1",
        title: "Today's Promo Review",
        start: new Date(),
        end: new Date(Date.now() + 2 * 86_400_000),
        allDay: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "The Month grid highlights the current calendar day, independent of the `date` prop's month.",
      },
    },
  },
};

/** No events -- an empty month grid with no bars or chips. */
export const EmptyMonth: Story = {
  args: { date: day("07-15"), events: [] },
};

/** Custom `#event` slot content -- here rendering the title plus a duration badge. */
export const CustomEventSlot: Story = {
  args: { date: day("07-15") },
  render: (args) => ({
    components: { VcScheduler },
    setup: () => ({ args }),
    template: `<div style="height:640px"><VcScheduler v-bind="args">
      <template #event="{ event }">
        <strong>{{ event.title }}</strong>
      </template>
    </VcScheduler></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `#event` slot receives `{ event }` and fully replaces the default title text for both bars and chips.",
      },
    },
  },
};

/** `firstDayOfWeek: 0` starts the Month grid on Sunday instead of the ISO default (Monday). */
export const FirstDayOfWeekSunday: Story = {
  args: { date: day("07-15"), firstDayOfWeek: 0 },
};

// -- Timeline view --

/** `view="timeline-day"` renders the SAME events on a vertical hour grid for one day. */
export const TimelineView: Story = {
  args: {
    view: "timeline-day",
    views: ["month", "timeline-day", "timeline-week"],
    editable: true,
    quickInfo: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Timeline Day renders the same events on a vertical hour grid, switchable from the toolbar.",
      },
    },
  },
};

/** Timeline Day: the same events on a vertical hour grid for one focused day. */
export const TimelineDay: Story = {
  args: {
    view: "timeline-day",
    views: ["month", "timeline-day", "timeline-week"],
    date: new Date(2021, 0, 13),
    events: timedEvents,
  },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          "Timeline Day shows a day header over a vertical hour grid (hours down the left gutter). Timed events are placed by their exact start/end and split into side-by-side lanes when they overlap; all-day events sit in a strip above the grid. Fully stateful -- clicking an event opens the quick-info popover, and switching views/navigating updates local state.",
      },
    },
  },
};

/** Timeline Week: 7 day columns over a shared vertical hour grid. */
export const TimelineWeek: Story = {
  args: {
    view: "timeline-week",
    views: ["month", "timeline-day", "timeline-week"],
    date: new Date(2021, 0, 13),
    events: timedEvents,
  },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          "Timeline Week renders 7 day columns (starting from `firstDayOfWeek`) over a shared vertical hour grid -- all 7 days fit on screen without horizontal scrolling; scroll vertically through the hours.",
      },
    },
  },
};

// -- Playground --

/**
 * Fully interactive sandbox: editable, quick-info popover enabled, every event
 * wired to local state. Use this to try prev/next/today navigation, drag-move,
 * single-click/double-click/drag on an empty cell (quick-create popover / editor
 * modal), and the click-to-open popover with its Edit (opens the editor modal) and
 * Delete actions.
 */
export const Playground: Story = {
  args: {
    date: day("07-15"),
    editable: true,
    quickInfo: true,
  },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          'A fully wired sandbox -- every event (`update:date`, `update:view`, `event-update`, `event-create`, `event-delete`, `event-click`) is live, and the built-in quick-create popover / editor modal are on (`editorMode` defaults to "builtin"). Click an event to open the quick-info popover; try Edit (opens the editor modal) and Delete.',
      },
    },
  },
};

/** Clicking an event bar or timed chip opens the built-in quick-info popover (title, date range, Edit/Delete). Disable with `quickInfo: false` for a fully custom click flow. */
export const QuickInfoPopover: Story = {
  args: { date: day("07-15"), quickInfo: true },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          'Click "Flash Deal" (or any event) to see the quick-info popover. Its "Delete" button emits `event-delete` and closes the popover; its "Edit" button opens the built-in editor modal (edit mode) instead of emitting an event -- `event-edit` only fires when `editorMode` is "emit". Escape and backdrop click also close the popover.',
      },
    },
  },
};

// -- Editing UX --

/**
 * Walks through the full built-in create/edit flow on an empty Month grid, backed by
 * local state (create pushes, update replaces by id, delete removes) so the result of
 * every action is actually visible:
 *
 * 1. **Single-click** an empty day cell -- the quick-create popover opens, anchored to
 *    the cell, with just a title field. Type a title and hit Save (or Enter) to create
 *    the event.
 * 2. **Double-click** (or click-drag across) an empty cell -- the editor modal opens
 *    directly in create mode, pre-filled with the clicked/dragged range, with all-day,
 *    date/time, and color fields.
 * 3. In the quick-create popover, **"More options"** hands off to the same editor modal
 *    (create mode), carrying over whatever title was already typed.
 * 4. **Click an existing event**, then **Edit** in the quick-info popover -- the editor
 *    modal opens in edit mode, pre-filled from the event; Save commits the change,
 *    Delete removes it.
 */
export const EditingFlow: Story = {
  args: { date: day("07-15"), events: [], editable: true, quickInfo: true },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          'Starts from an empty month so every created event is easy to spot. Single-click an empty cell for the quick-create popover; double-click or drag for the editor modal; click an event then "Edit" for the editor modal in edit mode.',
      },
    },
  },
};

/**
 * With `editorMode: "emit"`, the built-in quick-create popover and editor modal are
 * skipped entirely: a create gesture (single/double-click or drag on an empty cell)
 * emits `event-create` directly with an empty title, and the quick-info popover's
 * "Edit" button emits `event-edit` with the full event -- both logged in the Storybook
 * Actions panel -- for hosts that want to drive their own create/edit UI.
 */
export const EmitMode: Story = {
  args: { date: day("07-15"), editable: true, quickInfo: true, editorMode: "emit" },
  parameters: {
    docs: {
      description: {
        story:
          'With `editorMode: "emit"`, no built-in popover/modal opens. Click an empty cell to see `event-create` fire directly (empty title, no UI); click an event then "Edit" to see `event-edit` fire instead of the editor modal -- check the Actions panel.',
      },
    },
  },
};

/**
 * On phones (viewport-driven `IsMobileKey`) the Month grid is replaced by a vertical
 * agenda: only days of the focused month that have events, each with its events (color
 * dot, time, title). Tap an event for the quick-info popover; the "New event" button
 * opens the editor. This story forces the mobile breakpoint and a phone-width frame.
 */
export const MobileAgenda: Story = {
  args: { date: new Date(2026, 6, 15), events, editable: true, quickInfo: true },
  render: renderMobileAgenda,
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-only agenda view: Month collapses to a day-grouped event list on narrow screens. Tap an event for quick-info/Edit; use 'New event' to create.",
      },
    },
  },
};

// -- Recurrence --

/**
 * A weekly recurring master (`recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=8"`) expands
 * into 8 occurrences across Jul 1-17 2026, each marked with a "↻" icon. One occurrence
 * (Jul 8) is skipped via the master's `exceptionDates`; another (Jul 13) is replaced by a
 * separate override event (`recurrenceId` + `originalStart` pointing at the synthesized
 * occurrence it stands in for) moved to the afternoon with its own title/color.
 *
 * Click any occurrence, then **Edit** or **Delete** in the quick-info popover -- a
 * **This event / All events** scope dialog asks which to apply to:
 * - **This event** on Edit opens the editor for just that occurrence (no recurrence field);
 *   saving creates/updates an override, leaving the rest of the series untouched.
 * - **All events** on Edit opens the editor pre-filled with the master's recurrence rule;
 *   saving updates every occurrence.
 * - **This event** on Delete adds the day to the master's `exceptionDates` (and removes its
 *   override, if any) -- only that occurrence disappears.
 * - **All events** on Delete removes the master itself -- the whole series disappears.
 *
 * You can also create a brand-new recurring series: double-click (or drag) an empty cell,
 * then set Repeat in the editor's recurrence form (Daily/Weekly/Monthly/Yearly, every N,
 * weekday toggles, End: Never/After N/On date).
 */
export const RecurringEvents: Story = {
  args: { date: day("07-15"), events: recurringEvents, editable: true, quickInfo: true },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          "Weekly series (Mon/Wed/Fri, 8 occurrences) with a skipped day (Jul 8) and an overridden occurrence (Jul 13, moved to the afternoon). Edit or Delete any occurrence to see the This event / All events scope dialog; try both choices to see the difference in effect.",
      },
    },
  },
};

/**
 * Recurring events are not limited to a single day -- a master that spans
 * multiple days produces multi-day occurrences, because the expansion carries
 * the master's full duration onto every occurrence.
 *
 * - **Weekend Flash Sale** -- an all-day event covering Fri->Sun, repeated every
 *   Friday. Each occurrence renders as a 3-day spanning bar.
 * - **Quarterly Stocktake** -- a timed event running Tue 08:00 -> Thu 17:00,
 *   repeated every 2 weeks. Multi-day spans work for timed events too.
 */
export const RecurringMultiDay: Story = {
  args: { date: day("07-15"), events: recurringMultiDay, editable: true, quickInfo: true },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          "Multi-day recurring series: a 3-day all-day 'Weekend Flash Sale' every Friday, plus a timed 'Quarterly Stocktake' spanning Tue->Thu every two weeks. Each occurrence keeps the master's duration, so the recurrence renders as spanning bars rather than single-day chips.",
      },
    },
  },
};

// -- Loading --

/** First-load state: a view-shaped skeleton while events are being fetched. */
export const Loading: Story = {
  args: { loading: true, events: [], editable: true, views: ["month", "timeline-day", "timeline-week"] },
  parameters: {
    docs: {
      description: {
        story:
          "With `loading` and no events yet, the scheduler shows a skeleton shaped like the active view (Month/Timeline/Agenda). When `loading` is set while events already exist (a refresh), it shows a loading overlay over the current content instead of the skeleton.",
      },
    },
  },
};

// -- Timeline current-time line (anchored to today) --

const nowRef = new Date();
const atToday = (h: number, m = 0) => {
  const d = new Date(nowRef);
  d.setHours(h, m, 0, 0);
  return d;
};
const todayTimelineEvents: ISchedulerEvent[] = [
  { id: "tt1", title: "Morning sync", start: atToday(9), end: atToday(10) },
  { id: "tt2", title: "Pricing review", start: atToday(13), end: atToday(14, 30) },
];

/** Timeline anchored to today so the current-time line is visible. */
export const TimelineToday: Story = {
  args: {
    view: "timeline-day",
    views: ["month", "timeline-day", "timeline-week"],
    date: nowRef,
    events: todayTimelineEvents,
    editable: true,
    quickInfo: true,
  },
  render: renderInteractive,
  parameters: {
    docs: {
      description: {
        story:
          "Timeline focused on today: a thin red current-time line with a dot is drawn in the today column at the current hour (updated each minute). It only renders when today is in view and within the shown hour range, which is why the fixed-date Timeline stories above don't show it.",
      },
    },
  },
};
