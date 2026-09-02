<template>
  <VcPopover
    :show="open && !!date"
    :anchor-ref="anchorEl"
    :title="title"
    placement="bottom-start"
    :content-scrollable="true"
    role="dialog"
    :aria-label="$t('VC_SCHEDULER.MORE_EVENTS')"
    @update:show="(v) => !v && emit('close')"
  >
    <ul
      ref="listRef"
      class="vc-scheduler__more-popover-list"
      @keydown.esc.stop.prevent="emit('close')"
    >
      <li
        v-for="e in events"
        :key="e.id"
      >
        <!-- A real button per entry: for a day with more than 3 events this popover is the only
             way to reach the rest, so each one must be focusable and operable by keyboard
             (WCAG 2.1.1, 4.1.2). The #event slot replaces the title text, same as in the bars. -->
        <button
          type="button"
          class="vc-scheduler__more-popover-item"
          @click="(ev) => emit('event-click', e, (ev.currentTarget as HTMLElement).getBoundingClientRect())"
        >
          <slot
            name="event"
            :event="e"
            >{{ e.title }}</slot
          >
        </button>
      </li>
    </ul>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { format } from "date-fns";
import type { ReferenceElement } from "@floating-ui/vue";
import { VcPopover } from "@ui/components/molecules/vc-popover";
import { useAnchoredPanelFocus } from "../../composables/useAnchoredPanelFocus";
import type { ISchedulerEvent } from "../../types";

const props = defineProps<{
  open: boolean;
  date: Date | null;
  events: ISchedulerEvent[];
  /** Bounding rect of the clicked "+N more" cell; wrapped as a floating-ui virtual anchor. */
  anchorRect: DOMRect | null;
}>();
const emit = defineEmits<{
  (e: "event-click", ev: ISchedulerEvent, rect: DOMRect | null): void;
  (e: "close"): void;
}>();

const title = computed(() => (props.date ? format(props.date, "PPP") : ""));

// Anchor the popover to the clicked cell so it opens at the click, not at the
// document origin (the old hand-rolled absolute popover had no positioning).
const anchorEl = computed<ReferenceElement | null>(() =>
  props.anchorRect ? { getBoundingClientRect: () => props.anchorRect as DOMRect } : null,
);

// The panel is teleported to the end of the document, so focus has to be moved in
// deliberately and handed back on close.
const listRef = ref<HTMLElement | null>(null);

useAnchoredPanelFocus(
  () => props.open,
  listRef,
  () => listRef.value?.querySelector<HTMLElement>("button"),
);
</script>

<style lang="scss">
.vc-scheduler__more-popover-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0.75rem 0.75rem;
  min-width: 11rem;
}
.vc-scheduler__more-popover-item {
  // Native button chrome stripped; the row keeps the look it had as a plain <li>.
  appearance: none;
  background: none;
  border: 0;
  display: flex;
  align-items: center;
  width: 100%;
  font: inherit;
  color: inherit;
  text-align: left;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  // 24px minimum for WCAG 2.2 SC 2.5.8 — these rows sit directly against each other.
  min-height: 24px;
  &:hover {
    background: var(--neutrals-100);
  }
}
</style>
