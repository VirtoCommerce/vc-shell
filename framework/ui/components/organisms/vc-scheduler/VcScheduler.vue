<!-- framework/ui/components/organisms/vc-scheduler/VcScheduler.vue -->
<template>
  <div
    v-loading:49="loading && !showSkeleton"
    class="vc-scheduler"
    :aria-busy="loading || undefined"
  >
    <slot
      name="toolbar"
      :title="nav.title.value"
      :view="viewModel"
    >
      <SchedulerToolbar
        :title="nav.title.value"
        :view="viewModel"
        :views="toolbarViews"
        :editable="editable"
        :current="isCurrentPeriod"
        @prev="nav.goPrev"
        @next="nav.goNext"
        @today="nav.goToday"
        @create="onToolbarCreate"
        @update:view="viewModel = $event"
      />
    </slot>

    <!-- First load (no events yet): a view-shaped skeleton. Refresh over existing events
         uses the v-loading overlay on the root instead. -->
    <slot
      v-if="showSkeleton"
      name="loading"
    >
      <SchedulerSkeleton :view="skeletonView" />
    </slot>

    <template v-else>
      <!-- On phones the Month grid is too cramped; show a vertical agenda instead. -->
      <SchedulerAgendaView
        v-if="viewModel === 'month' && isMobile"
        :events="displayEvents"
        :focused-date="dateModel"
        :editable="editable"
        :is-event-editable="isEventEditableGetter"
        :quick-info="quickInfo"
        @event-click="(e) => emit('event-click', e)"
        @create-intent="onCreateIntent"
        @edit-intent="onEditIntent"
        @event-delete="onEventDeleteIntent"
      >
        <template #event="{ event }">
          <slot
            name="event"
            :event="event"
          />
        </template>
        <template #event-popover="{ event, close }">
          <slot
            name="event-popover"
            :event="event"
            :close="close"
          />
        </template>
        <template #empty>
          <slot name="empty" />
        </template>
      </SchedulerAgendaView>

      <SchedulerMonthView
        v-else-if="viewModel === 'month'"
        :events="displayEvents"
        :focused-date="dateModel"
        :first-day-of-week="firstDayOfWeek"
        :editable="editable"
        :is-event-editable="isEventEditableGetter"
        :quick-info="quickInfo"
        @event-click="(e) => emit('event-click', e)"
        @create-intent="onCreateIntent"
        @event-update="(u) => emit('event-update', u)"
        @edit-intent="onEditIntent"
        @event-delete="onEventDeleteIntent"
      >
        <template #event="{ event }">
          <slot
            name="event"
            :event="event"
          />
        </template>
        <template #event-popover="{ event, close }">
          <slot
            name="event-popover"
            :event="event"
            :close="close"
          />
        </template>
      </SchedulerMonthView>

      <SchedulerTimelineView
        v-else
        :events="displayEvents"
        :focused-date="dateModel"
        :first-day-of-week="firstDayOfWeek"
        :editable="editable"
        :is-event-editable="isEventEditableGetter"
        :quick-info="quickInfo"
        :mode="viewModel === 'timeline-week' ? 'week' : 'day'"
        :day-start-hour="dayStartHour"
        :day-end-hour="dayEndHour"
        @event-click="(e) => emit('event-click', e)"
        @create-intent="onCreateIntent"
        @edit-intent="onEditIntent"
        @event-delete="onEventDeleteIntent"
      >
        <template #event="{ event }">
          <slot
            name="event"
            :event="event"
          />
        </template>
        <template #event-popover="{ event, close }">
          <slot
            name="event-popover"
            :event="event"
            :close="close"
          />
        </template>
        <template #empty>
          <slot name="empty" />
        </template>
      </SchedulerTimelineView>
    </template>

    <slot
      name="quick-create"
      :open="quick.open"
      :anchor-rect="quick.anchorRect"
      :draft="quick.draft ?? EMPTY_DRAFT"
      :save="onQuickSave"
      :more="onQuickMore"
      :close="onQuickClose"
    >
      <QuickCreatePopover
        :open="quick.open"
        :anchor-rect="quick.anchorRect"
        :draft="quick.draft ?? EMPTY_DRAFT"
        @save="onQuickSave"
        @more="onQuickMore"
        @close="onQuickClose"
      />
    </slot>

    <slot
      name="event-editor"
      :open="editor.open"
      :mode="editor.mode"
      :draft="editor.draft ?? EMPTY_DRAFT"
      :allow-recurrence="editor.allowRecurrence"
      :allow-color="allowColor"
      :save="onEditorSave"
      :delete="onEditorDelete"
      :close="onEditorClose"
    >
      <SchedulerEventEditor
        :open="editor.open"
        :draft="editor.draft ?? EMPTY_DRAFT"
        :mode="editor.mode"
        :allow-recurrence="editor.allowRecurrence"
        :allow-color="allowColor"
        @save="onEditorSave"
        @delete="onEditorDelete"
        @close="onEditorClose"
      />
    </slot>

    <RecurrenceScopeDialog
      :open="scope.open"
      :action="scope.action"
      @select="onScopeSelect"
      @close="onScopeClose"
    />

    <ConfirmDialog
      :open="confirmDelete.open"
      :title="t('VC_SCHEDULER.DELETE_CONFIRM_TITLE')"
      :body="t('VC_SCHEDULER.DELETE_CONFIRM_BODY', { title: confirmDelete.event?.title ?? '' })"
      :confirm-label="t('VC_SCHEDULER.DELETE')"
      @confirm="onConfirmDelete"
      @close="onCancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import {
  startOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from "date-fns";
import { useResponsive } from "@core/composables/useResponsive";
import { vLoading } from "@core/directives";
import SchedulerToolbar from "./_internal/SchedulerToolbar.vue";
import SchedulerSkeleton from "./_internal/SchedulerSkeleton.vue";
import SchedulerMonthView from "./_internal/views/SchedulerMonthView.vue";
import SchedulerAgendaView from "./_internal/views/SchedulerAgendaView.vue";
import SchedulerTimelineView from "./_internal/views/SchedulerTimelineView.vue";
import QuickCreatePopover from "./_internal/quick-create/QuickCreatePopover.vue";
import SchedulerEventEditor from "./_internal/editor/SchedulerEventEditor.vue";
import RecurrenceScopeDialog from "./_internal/editor/RecurrenceScopeDialog.vue";
import ConfirmDialog from "./_internal/editor/ConfirmDialog.vue";
import { useSchedulerNavigation } from "./composables/useSchedulerNavigation";
import { expandEvents, parseRRule, toRRule } from "./composables/useRecurrence";
import type { ICreateIntent } from "./composables/useEventInteraction";
import { SchedulerCalendarContextKey } from "./injection-keys";
import type { IEventDraft, ISchedulerEvent, SchedulerView } from "./types";

const props = withDefaults(
  defineProps<{
    events?: ISchedulerEvent[];
    view?: SchedulerView;
    /**
     * Which views the toolbar offers, in order. Defaults to Month only — the hour-granular
     * timeline views are opt-in (pass e.g. ["month", "timeline-day", "timeline-week"]).
     * The switcher is hidden when only one view is listed.
     */
    views?: SchedulerView[];
    /**
     * Show a manual Color field in the editor. Off by default — event colors are
     * auto-derived from the title (deterministic, not stored), so users don't pick them.
     */
    allowColor?: boolean;
    date?: Date;
    editable?: boolean;
    firstDayOfWeek?: number;
    isEventEditable?: (e: ISchedulerEvent) => boolean;
    /** Built-in quick-info popover on event click. Disable for a fully custom flow. */
    quickInfo?: boolean;
    /** Timeline views. First rendered hour column, 0-23. */
    dayStartHour?: number;
    /** Timeline views. Last rendered hour column (exclusive), 1-24. */
    dayEndHour?: number;
    /**
     * "builtin" (default) opens the quick-create popover / editor modal for create and
     * edit intents. "emit" skips the built-in UI entirely and re-emits the intent as a
     * public event instead, for hosts that want to drive their own create/edit flow.
     */
    editorMode?: "builtin" | "emit";
    /** Async loading: shows a view-shaped skeleton on first load (no events yet), or a
     *  loading overlay when refreshing over existing events. */
    loading?: boolean;
  }>(),
  {
    events: () => [],
    view: undefined,
    views: () => ["month"],
    allowColor: false,
    date: undefined,
    editable: false,
    // No trivial locale-driven source for this yet; Monday matches ISO 8601 and the
    // repo's date-fns usage elsewhere. Revisit once a locale-aware default lands.
    firstDayOfWeek: 1,
    isEventEditable: undefined,
    quickInfo: true,
    dayStartHour: 0,
    dayEndHour: 24,
    editorMode: "builtin",
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "update:view", v: SchedulerView): void;
  (e: "update:date", d: Date): void;
  (e: "event-click", ev: ISchedulerEvent): void;
  (
    e: "event-create",
    c: {
      start: Date;
      end: Date;
      allDay: boolean;
      title: string;
      color?: string;
      /** Set when creating a recurring master (RRULE text, via toRRule). */
      recurrence?: string;
      /** Set when creating a single-occurrence override of a recurring series. */
      recurrenceId?: string;
      originalStart?: Date;
    },
  ): void;
  (
    e: "event-update",
    u: {
      id: string;
      start: Date;
      end: Date;
      title?: string;
      allDay?: boolean;
      color?: string;
      /** Set when saving "all events" on a recurring master (RRULE text, via toRRule). */
      recurrence?: string;
      /** Set when detaching an occurrence from the series ("this event" delete). */
      exceptionDates?: Date[];
      /** Set when updating an existing single-occurrence override. */
      recurrenceId?: string;
      originalStart?: Date;
    },
  ): void;
  // Emitted only when editorMode === "emit" (built-in mode opens the editor instead).
  (e: "event-edit", ev: ISchedulerEvent): void;
  (e: "event-delete", p: { id: string }): void;
}>();

// On phones the Month grid is replaced by a vertical agenda list.
const { isMobile } = useResponsive();
const { t } = useI18n();

// Fallback draft passed to the built-in popover/editor while closed, so they always
// receive a well-formed IEventDraft even before the first create/edit intent arrives.
const EMPTY_DRAFT: IEventDraft = { title: "", start: new Date(0), end: new Date(0), allDay: false };

interface IRecurrenceEditScope {
  /** "all" targets the master series; "this" creates/updates a single-occurrence override. */
  scope: "all" | "this";
  recurrenceId: string;
  originalStart: Date;
  /** Set only for "this" when an override already exists for this occurrence (edit vs create on save). */
  overrideId?: string;
}

const editor = reactive<{
  open: boolean;
  mode: "create" | "edit";
  draft: IEventDraft | null;
  /** Set only while routed through the recurrence scope dialog; null for every plain create/edit. */
  recurrenceEdit: IRecurrenceEditScope | null;
  /** False only for a single-occurrence ("this" scope) edit — recurrence doesn't apply to an override. */
  allowRecurrence: boolean;
}>({
  open: false,
  mode: "create",
  draft: null,
  recurrenceEdit: null,
  allowRecurrence: true,
});
const quick = reactive<{ open: boolean; anchorRect: DOMRect | null; draft: IEventDraft | null }>({
  open: false,
  anchorRect: null,
  draft: null,
});
const scope = reactive<{ open: boolean; action: "edit" | "delete"; event: ISchedulerEvent | null }>({
  open: false,
  action: "edit",
  event: null,
});
// One-off (non-recurring) delete confirmation. Recurring deletes use `scope` above instead.
const confirmDelete = reactive<{ open: boolean; event: ISchedulerEvent | null }>({
  open: false,
  event: null,
});

function onCreateIntent(p: ICreateIntent) {
  if (props.editorMode === "emit") {
    emit("event-create", { start: p.start, end: p.end, allDay: p.allDay, title: "" });
    return;
  }
  if (p.kind === "single") {
    quick.draft = { title: "", start: p.start, end: p.end, allDay: p.allDay, color: undefined };
    quick.anchorRect = p.anchorRect;
    quick.open = true;
    return;
  }
  editor.draft = { title: "", start: p.start, end: p.end, allDay: p.allDay, color: undefined };
  editor.mode = "create";
  editor.recurrenceEdit = null;
  editor.allowRecurrence = true;
  editor.open = true;
}

// Toolbar "+ New event": no clicked cell to anchor to, so open the full editor (kind "double")
// seeded with an all-day event on the focused date.
function onToolbarCreate() {
  const start = startOfDay(dateModel.value);
  onCreateIntent({ start, end: addDays(start, 1), allDay: true, anchorRect: null, kind: "double" });
}

function onEditIntent(ev: ISchedulerEvent) {
  if (props.editorMode === "emit") {
    emit("event-edit", ev);
    return;
  }
  // Defense-in-depth: the create path already gates on `editable` at the view level;
  // mirror that here so a non-editable scheduler never opens the built-in editor even
  // if some other entry point reaches this intent.
  if (!props.editable) return;
  // A recurring occurrence needs to know whether the edit applies to the whole series or
  // just this one instance before the editor opens at all.
  if (ev.recurrenceId) {
    scope.open = true;
    scope.action = "edit";
    scope.event = ev;
    return;
  }
  editor.draft = { id: ev.id, title: ev.title, start: ev.start, end: ev.end, allDay: !!ev.allDay, color: ev.color };
  editor.mode = "edit";
  editor.recurrenceEdit = null;
  editor.allowRecurrence = true;
  editor.open = true;
}

function onEventDeleteIntent(p: { id: string }) {
  // editorMode "emit" hands the whole create/edit/delete flow to the host; never intercept.
  if (props.editorMode !== "emit") {
    const ev = displayEvents.value.find((e) => e.id === p.id);
    if (ev?.recurrenceId) {
      scope.open = true;
      scope.action = "delete";
      scope.event = ev;
      return;
    }
    // A one-off delete is irreversible and had no speed bump; confirm first. (Recurring
    // deletes are already gated by the scope dialog above.)
    if (ev) {
      confirmDelete.open = true;
      confirmDelete.event = ev;
      return;
    }
  }
  emit("event-delete", p);
}

function onConfirmDelete() {
  const ev = confirmDelete.event;
  confirmDelete.open = false;
  confirmDelete.event = null;
  if (ev) emit("event-delete", { id: ev.id });
}

function onCancelDelete() {
  confirmDelete.open = false;
  confirmDelete.event = null;
}

function findMaster(recurrenceId: string): ISchedulerEvent | undefined {
  return props.events.find((e) => e.id === recurrenceId);
}

function findOverrideEvent(recurrenceId: string, originalStart: Date): ISchedulerEvent | undefined {
  return props.events.find(
    (e) => e.recurrenceId === recurrenceId && e.originalStart?.getTime() === originalStart.getTime(),
  );
}

/**
 * Shared "delete this occurrence" semantics, used by both the scope-dialog delete+"this"
 * path and the editor's own Delete button when editing a "this"-scope occurrence: park the
 * date on the master's exceptionDates (so expandEvents stops resynthesizing it on the next
 * render) and drop the override event, if one exists.
 */
function deleteRecurringOccurrence(master: ISchedulerEvent, originalStart: Date) {
  emit("event-update", {
    id: master.id,
    start: master.start,
    end: master.end,
    exceptionDates: [...(master.exceptionDates ?? []), originalStart],
  });
  const override = findOverrideEvent(master.id, originalStart);
  if (override) emit("event-delete", { id: override.id });
}

function onScopeSelect(choice: "this" | "all") {
  const ev = scope.event;
  const action = scope.action;
  scope.open = false;
  scope.event = null;
  if (!ev?.recurrenceId || !ev.originalStart) return;

  // Defensive: an occurrence/override whose master is no longer present (e.g. removed from
  // `events` elsewhere) has nothing well-defined to route the choice to. No-op.
  const master = findMaster(ev.recurrenceId);
  if (!master) return;

  if (action === "delete") {
    if (choice === "all") {
      emit("event-delete", { id: master.id });
      return;
    }
    deleteRecurringOccurrence(master, ev.originalStart);
    return;
  }

  // action === "edit"
  if (choice === "all") {
    editor.draft = {
      id: master.id,
      title: master.title,
      start: master.start,
      end: master.end,
      allDay: !!master.allDay,
      color: master.color,
      recurrence: master.recurrence ? parseRRule(master.recurrence, master.start) : null,
    };
    editor.mode = "edit";
    editor.recurrenceEdit = { scope: "all", recurrenceId: master.id, originalStart: ev.originalStart };
    editor.allowRecurrence = true;
    editor.open = true;
    return;
  }

  // "this": a single override isn't itself recurring, so the editor's own recurrence field
  // is cleared; seed from the existing override (if any) or from the synthesized occurrence.
  const override = findOverrideEvent(ev.recurrenceId, ev.originalStart);
  editor.draft = {
    id: override?.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: !!ev.allDay,
    color: ev.color,
    recurrence: null,
  };
  editor.mode = "edit";
  editor.recurrenceEdit = {
    scope: "this",
    recurrenceId: ev.recurrenceId,
    originalStart: ev.originalStart,
    overrideId: override?.id,
  };
  // A single override isn't itself recurring — hide the recurrence form entirely.
  editor.allowRecurrence = false;
  editor.open = true;
}

function onScopeClose() {
  scope.open = false;
  scope.event = null;
}

function onQuickSave({ title }: { title: string }) {
  if (quick.draft) {
    const { start, end, allDay, color } = quick.draft;
    emit("event-create", { start, end, allDay, title, color });
  }
  quick.open = false;
}

function onQuickMore(payload: { title: string }) {
  if (quick.draft) {
    editor.draft = { ...quick.draft, title: payload.title };
    editor.mode = "create";
    editor.recurrenceEdit = null;
    editor.allowRecurrence = true;
    editor.open = true;
  }
  quick.open = false;
}

function onQuickClose() {
  quick.open = false;
}

function onEditorSave(draft: IEventDraft) {
  const recurrenceEdit = editor.recurrenceEdit;
  if (recurrenceEdit) {
    if (recurrenceEdit.scope === "all") {
      emit("event-update", {
        id: draft.id as string,
        start: draft.start,
        end: draft.end,
        title: draft.title,
        allDay: draft.allDay,
        color: draft.color,
        recurrence: draft.recurrence ? toRRule(draft.recurrence) : undefined,
      });
    } else {
      const overridePayload = {
        start: draft.start,
        end: draft.end,
        title: draft.title,
        allDay: draft.allDay,
        color: draft.color,
        recurrenceId: recurrenceEdit.recurrenceId,
        originalStart: recurrenceEdit.originalStart,
      };
      if (recurrenceEdit.overrideId) {
        emit("event-update", { id: recurrenceEdit.overrideId, ...overridePayload });
      } else {
        emit("event-create", overridePayload);
      }
    }
    editor.recurrenceEdit = null;
    editor.open = false;
    return;
  }

  if (editor.mode === "create") {
    emit("event-create", {
      start: draft.start,
      end: draft.end,
      allDay: draft.allDay,
      title: draft.title,
      color: draft.color,
      recurrence: draft.recurrence ? toRRule(draft.recurrence) : undefined,
    });
  } else {
    emit("event-update", {
      id: draft.id as string,
      start: draft.start,
      end: draft.end,
      title: draft.title,
      allDay: draft.allDay,
      color: draft.color,
    });
  }
  editor.open = false;
}

function onEditorDelete(p: { id: string }) {
  // The editor's own Delete button must route through the same recurrence-scope semantics
  // as the scope-dialog delete path, not a raw passthrough — otherwise a "this"-scope edit
  // with no override yet deletes `undefined`, and one with an override leaves the master's
  // exceptionDates unset so the "deleted" occurrence resynthesizes on the next render.
  const recurrenceEdit = editor.recurrenceEdit;
  if (recurrenceEdit) {
    const master = findMaster(recurrenceEdit.recurrenceId);
    if (master) {
      if (recurrenceEdit.scope === "all") {
        emit("event-delete", { id: master.id });
      } else {
        deleteRecurringOccurrence(master, recurrenceEdit.originalStart);
      }
    }
    editor.open = false;
    editor.recurrenceEdit = null;
    return;
  }

  emit("event-delete", p);
  editor.open = false;
  editor.recurrenceEdit = null;
}

function onEditorClose() {
  editor.open = false;
  editor.recurrenceEdit = null;
}

// Toolbar view-switcher options, derived from the `views` prop (Month-only by default).
const VIEW_LABEL_KEYS: Record<SchedulerView, string> = {
  month: "VC_SCHEDULER.MONTH",
  "timeline-day": "VC_SCHEDULER.TIMELINE_DAY",
  "timeline-week": "VC_SCHEDULER.TIMELINE_WEEK",
};
const toolbarViews = computed(() => props.views.map((v) => ({ value: v, label: t(VIEW_LABEL_KEYS[v]) })));

// Uncontrolled fallbacks: used only while the matching prop is left unset, so the
// component works standalone (no v-model) as well as fully controlled. Defaults to the
// first allowed view so a Timeline-only config doesn't start on a hidden Month.
const internalView = ref<SchedulerView>(props.view ?? props.views[0] ?? "month");
const viewModel = computed<SchedulerView>({
  get: () => props.view ?? internalView.value,
  set: (v) => {
    internalView.value = v;
    emit("update:view", v);
  },
});

const internalDate = ref<Date>(props.date ?? new Date());
const dateModel = computed<Date>({
  get: () => props.date ?? internalDate.value,
  set: (d) => {
    internalDate.value = d;
    emit("update:date", d);
  },
});

// Whether the focused period already contains today (per active view) — disables Today.
const isCurrentPeriod = computed(() => {
  const d = dateModel.value;
  const now = new Date();
  if (viewModel.value === "timeline-day") return isSameDay(d, now);
  if (viewModel.value === "timeline-week") {
    return isSameWeek(d, now, { weekStartsOn: (props.firstDayOfWeek % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  }
  return isSameMonth(d, now);
});

// Superset window covering whatever the active view actually renders, so recurring
// masters expand into enough occurrences for the view without each view re-deriving
// its own recurrence logic. Timeline views additionally filter to their own exact
// window internally; this only needs to be a superset for the active view.
const expansionWindow = computed(() => {
  const d = dateModel.value;
  const weekStartsOn = (props.firstDayOfWeek % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  if (viewModel.value === "timeline-day") return { start: startOfDay(d), end: endOfDay(d) };
  if (viewModel.value === "timeline-week") {
    return { start: startOfWeek(d, { weekStartsOn }), end: endOfWeek(d, { weekStartsOn }) };
  }
  // month / mobile agenda: the 6-week grid superset
  const start = startOfWeek(startOfMonth(d), { weekStartsOn });
  return { start, end: addDays(start, 42) };
});

const displayEvents = computed(() => expandEvents(props.events, expansionWindow.value));

// First-load skeleton (loading with nothing to show yet). A refresh over existing events
// uses the root v-loading overlay instead, so content stays visible.
const showSkeleton = computed(() => props.loading && displayEvents.value.length === 0);
const skeletonView = computed<"month" | "timeline" | "agenda">(() => {
  if (viewModel.value === "month") return isMobile.value ? "agenda" : "month";
  return "timeline";
});

const nav = useSchedulerNavigation({
  date: dateModel,
  view: viewModel,
  firstDayOfWeek: toRef(props, "firstDayOfWeek"),
  onDateChange: (d) => {
    dateModel.value = d;
  },
});

// Getter (never a static capture) so a callback prop that arrives later, or flips
// to undefined, is always read fresh.
const isEventEditableGetter = (e: ISchedulerEvent) => (props.isEventEditable ? props.isEventEditable(e) : true);

provide(SchedulerCalendarContextKey, {
  focusedDate: dateModel,
  view: viewModel,
  editable: toRef(props, "editable"),
  firstDayOfWeek: toRef(props, "firstDayOfWeek"),
  isEventEditable: isEventEditableGetter,
});
</script>

<style lang="scss">
.vc-scheduler {
  --scheduler-border-color: var(--neutrals-300);
  --scheduler-surface-color: var(--additional-50, #fff);

  display: flex;
  flex-direction: column;
  height: 100%;
  // The component draws its own border and radius, so it presents as a card and has to paint
  // its own surface. The day cells always painted theirs, but the toolbar and the weekday
  // header have no background of their own, so they fell through to whatever sat behind the
  // component. On a themed host surface that looks right; on a plain page in dark theme it left
  // the dark-theme (near-white) foreground on a white backdrop (VCST-5677). Same token the day
  // cells use, so the whole card stays one surface in both themes.
  background: var(--scheduler-surface-color);
  // One rounded frame around the whole component (toolbar + active view). The
  // toolbar's own border-bottom is now purely an internal divider — the outer
  // border/radius live here so a view (e.g. Month) never draws a second frame
  // that collides with the toolbar divider at the rounded corners.
  overflow: hidden;
  border: 1px solid var(--scheduler-border-color);
  border-radius: 0.5rem;
}
</style>
