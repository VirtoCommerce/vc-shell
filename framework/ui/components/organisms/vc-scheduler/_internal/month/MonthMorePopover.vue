<template>
  <VcPopover
    :show="open && !!date"
    :anchor-ref="anchorEl"
    :title="title"
    placement="bottom-start"
    :content-scrollable="true"
    @update:show="(v) => !v && emit('close')"
  >
    <ul class="vc-scheduler__more-popover-list">
      <li
        v-for="e in events"
        :key="e.id"
        @click="(ev) => emit('event-click', e, (ev.currentTarget as HTMLElement).getBoundingClientRect())"
      >
        <slot
          name="event"
          :event="e"
          >{{ e.title }}</slot
        >
      </li>
    </ul>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";
import type { ReferenceElement } from "@floating-ui/vue";
import { VcPopover } from "@ui/components/molecules/vc-popover";
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
</script>

<style lang="scss">
.vc-scheduler__more-popover-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0.75rem 0.75rem;
  min-width: 11rem;
}
.vc-scheduler__more-popover-list li {
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  &:hover {
    background: var(--neutrals-100);
  }
}
</style>
