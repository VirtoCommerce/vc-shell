<template>
  <VcPopover
    :show="open && !!event"
    :anchor-ref="anchorEl"
    placement="bottom-start"
    :content-scrollable="false"
    @update:show="onShowChange"
  >
    <!-- Colored header band tying the popover to the event (full tint + auto-contrast ink,
         not a side stripe). Carries the title and the close control. -->
    <template #header="{ close: closePanel }">
      <div
        class="vc-scheduler__qi-header"
        :style="headerStyle"
      >
        <span
          class="vc-scheduler__qi-dot"
          :style="dotStyle"
          aria-hidden="true"
        />
        <span class="vc-scheduler__qi-title">{{ event?.title }}</span>
        <button
          type="button"
          class="vc-scheduler__qi-close"
          :aria-label="$t('VC_SCHEDULER.CLOSE')"
          @click="closePanel"
        >
          <VcIcon
            icon="lucide-x"
            size="s"
          />
        </button>
      </div>
    </template>

    <slot
      name="event-popover"
      :event="event"
      :close="close"
    >
      <div class="vc-scheduler__qi-body">
        <div class="vc-scheduler__qi-row">
          <VcIcon
            icon="lucide-calendar-clock"
            size="s"
            class="vc-scheduler__qi-ico"
          />
          <span class="vc-scheduler__qi-text">{{ dateRangeLabel }}</span>
        </div>
        <div
          v-if="recurrenceText"
          class="vc-scheduler__qi-row"
        >
          <VcIcon
            icon="lucide-repeat"
            size="s"
            class="vc-scheduler__qi-ico"
          />
          <span class="vc-scheduler__qi-text">{{ recurrenceText }}</span>
        </div>
        <div
          v-if="categoryText"
          class="vc-scheduler__qi-row"
        >
          <VcIcon
            icon="lucide-tag"
            size="s"
            class="vc-scheduler__qi-ico"
          />
          <span class="vc-scheduler__qi-text">{{ categoryText }}</span>
        </div>
      </div>
    </slot>

    <template
      v-if="canEdit"
      #footer
    >
      <div class="vc-scheduler__qi-footer">
        <!-- Destructive action de-emphasized and set apart from Edit (icon + danger, left)
             so it isn't a mis-tap neighbour of the primary Edit (right). -->
        <VcButton
          text
          variant="danger"
          icon="lucide-trash-2"
          @click="onDelete"
          >{{ $t("VC_SCHEDULER.DELETE") }}</VcButton
        >
        <div class="vc-scheduler__qi-footer-spacer" />
        <VcButton
          text
          @click="onEdit"
          >{{ $t("VC_SCHEDULER.EDIT") }}</VcButton
        >
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { format, isSameDay } from "date-fns";
import type { ReferenceElement } from "@floating-ui/vue";
import { VcButton } from "@ui/components/atoms/vc-button";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcPopover } from "@ui/components/molecules/vc-popover";
import { autoEventColor } from "../../composables/useEventColor";
import { describeRRule } from "../../composables/useRecurrence";
import type { ISchedulerEvent } from "../../types";

const props = withDefaults(
  defineProps<{
    open: boolean;
    event: ISchedulerEvent | null;
    /** Bounding rect of the clicked bar/chip; wrapped as a floating-ui virtual anchor. */
    anchorRect: DOMRect | null;
    /** Whether the Edit/Delete actions row should render. False → view-only quick info. */
    canEdit?: boolean;
  }>(),
  { canEdit: true },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "edit", event: ISchedulerEvent): void;
  (e: "delete", payload: { id: string }): void;
}>();

// Wrap the captured rect as a floating-ui VirtualElement so VcPopover anchors to the clicked event.
const anchorEl = computed<ReferenceElement | null>(() =>
  props.anchorRect ? { getBoundingClientRect: () => props.anchorRect as DOMRect } : null,
);

const fill = computed(() => (props.event ? (props.event.color ?? autoEventColor(props.event.title)) : ""));
// A soft tint of the event color with dark text (not a full saturated fill) — the event's hue
// is carried by the leading dot, keeping the header calm and legible on any color.
const headerStyle = computed(() => ({
  background: `color-mix(in srgb, ${fill.value} 14%, var(--additional-50, #fff))`,
  color: "var(--neutrals-900)",
}));
const dotStyle = computed(() => ({ background: fill.value }));

const dateRangeLabel = computed(() => {
  const e = props.event;
  if (!e) return "";
  if (e.allDay) {
    const startLabel = format(e.start, "PPP");
    // end is exclusive for all-day spans; show the last inclusive day.
    const inclusiveEnd = new Date(e.end.getTime() - 1);
    const endLabel = format(inclusiveEnd, "PPP");
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  if (isSameDay(e.start, e.end)) {
    return `${format(e.start, "PPP")} · ${format(e.start, "p")} – ${format(e.end, "p")}`;
  }
  return `${format(e.start, "PPP p")} – ${format(e.end, "PPP p")}`;
});

// Recurrence summary. Occurrences carry the master's rule in meta.__rrule (see expandEvents);
// a master shown directly carries it on `recurrence`.
const recurrenceText = computed(() => {
  const e = props.event;
  if (!e) return "";
  const rule = e.recurrence ?? (e.meta?.__rrule as string | undefined);
  return rule ? describeRRule(rule) : "";
});

// Optional category/description line, only when the host put one on the event's meta.
const categoryText = computed(() => {
  const m = props.event?.meta;
  const v = m?.category ?? m?.description;
  return typeof v === "string" ? v : "";
});

function close() {
  emit("close");
}
function onShowChange(value: boolean) {
  if (!value) emit("close");
}
function onEdit() {
  if (!props.event) return;
  emit("edit", props.event);
  emit("close");
}
function onDelete() {
  if (!props.event) return;
  emit("delete", { id: props.event.id });
  emit("close");
}
</script>

<style lang="scss">
.vc-scheduler__qi-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.vc-scheduler__qi-dot {
  flex: none;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
}
.vc-scheduler__qi-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vc-scheduler__qi-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 150ms ease-out;
  &:hover {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 1px;
  }
}
.vc-scheduler__qi-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
}
.vc-scheduler__qi-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--neutrals-800);
}
.vc-scheduler__qi-ico {
  flex: none;
  margin-top: 0.0625rem;
  color: var(--neutrals-500);
}
.vc-scheduler__qi-text {
  min-width: 0;
}
.vc-scheduler__qi-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}
.vc-scheduler__qi-footer-spacer {
  flex: 1 1 auto;
}
@media (prefers-reduced-motion: reduce) {
  .vc-scheduler__qi-close {
    transition: none;
  }
}
</style>
