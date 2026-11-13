<!-- Phone: a line under the bar, "N results · View* · filtered from M · K filters · Clear all"; a piece without its data is left out -->
<template>
  <div
    v-if="hasCount || viewName || filterCount"
    class="vc-search-bar__summary"
  >
    <span
      v-if="hasCount"
      class="vc-search-bar__summary-part vc-search-bar__summary-count"
      >{{ $t(`${K}${filtered ? "RESULTS" : "ITEMS"}`, { count: resultCount }, resultCount!) }}</span
    >
    <span
      v-if="viewName"
      class="vc-search-bar__summary-part"
      >{{ viewName }}{{ modified ? "*" : "" }}</span
    >
    <span
      v-if="filtered && unfilteredCount !== undefined"
      class="vc-search-bar__summary-part"
      >{{ $t(`${K}FILTERED_FROM`, { count: unfilteredCount }) }}</span
    >
    <span
      v-if="filterCount"
      class="vc-search-bar__summary-part"
      >{{ $t(`${K}FILTER_COUNT`, { count: filterCount }, filterCount) }}</span
    >
    <!-- the separator goes with Clear all, so a wrapped line does not end in "·" -->
    <span
      v-if="filterCount"
      class="vc-search-bar__summary-part vc-search-bar__summary-action"
    >
      <VcButton
        class="vc-search-bar__summary-clear"
        variant="link"
        size="2xs"
        :disabled="disabled"
        @click="emit('clear')"
      >
        {{ $t(`${K}CLEAR_ALL`) }}
      </VcButton>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcButton } from "@ui/components/atoms";

defineOptions({ name: "PhoneSummary" });

const props = defineProps<{
  resultCount?: number;
  /** Rows without the bar's filters and search: "filtered from M" */
  unfilteredCount?: number;
  /** Filters or a search applied: "N results" instead of "N items" */
  filtered: boolean;
  filterCount: number;
  /** The current view; none for the unmodified system view */
  viewName?: string;
  modified?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{ clear: [] }>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PHONE.";
const hasCount = computed(() => props.resultCount !== undefined);
</script>

<style lang="scss">
.vc-search-bar {
  // Every part leads with its "·" in a 12px start padding; the line shifts back by it and clips the first
  // 9px, so the part that starts a line (the first, or one that wrapped) shows no separator
  &__summary {
    @apply tw-flex tw-flex-wrap tw-items-center tw-pt-1.5;
    margin-inline-start: -12px;
    clip-path: inset(-8px -8px -8px 9px);
    font-size: 12.5px;
    color: var(--neutrals-500);
  }
  &__summary-part {
    @apply tw-relative tw-whitespace-nowrap;
    padding-inline-start: 12px;

    &::before {
      @apply tw-absolute;
      content: "·";
      inset-inline-start: 3px;
      color: var(--neutrals-400);
    }
  }
  &__summary-action {
    @apply tw-inline-flex tw-items-center;
  }
  &__summary-count {
    @apply tw-font-medium;
    color: var(--neutrals-800);
  }
  // a link in the line of text: no padding of its own
  &__summary-clear {
    --button-2xs-padding-hor: 0;
  }
}
[dir="rtl"] .vc-search-bar__summary {
  clip-path: inset(-8px 9px -8px -8px);
}
</style>
