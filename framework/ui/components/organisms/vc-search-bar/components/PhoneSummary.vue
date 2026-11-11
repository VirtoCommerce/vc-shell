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
    <template v-if="filterCount">
      <span
        class="vc-search-bar__summary-sep"
        aria-hidden="true"
        >·</span
      >
      <button
        type="button"
        class="vc-search-bar__summary-clear"
        :disabled="disabled"
        @click="emit('clear')"
      >
        {{ $t(`${K}CLEAR_ALL`) }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "PhoneSummary" });

const props = defineProps<{
  resultCount?: number;
  /** Rows without the bar's filters and search: "filtered from M" */
  unfilteredCount?: number;
  /** Filters or a search applied: "N results" instead of "N items" */
  filtered: boolean;
  filterCount: number;
  /** The current view; none for the system view */
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
  &__summary {
    @apply tw-flex tw-flex-wrap tw-items-center tw-gap-x-1.5 tw-pt-1.5;
    font-size: 12.5px;
    color: var(--neutrals-500);
  }
  &__summary-part + &__summary-part::before {
    content: "·";
    margin-inline-end: 6px;
  }
  &__summary-part::before,
  &__summary-sep {
    color: var(--neutrals-400);
  }
  &__summary-count {
    @apply tw-font-medium;
    color: var(--neutrals-800);
  }
  &__summary-clear {
    @apply tw-font-medium;
    color: var(--primary-600);
    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  }
}
</style>
