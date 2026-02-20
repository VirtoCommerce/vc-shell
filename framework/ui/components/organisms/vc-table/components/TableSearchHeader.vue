<template>
  <Transition name="search-header">
    <div
      v-if="visible"
      class="vc-table-search-header"
    >
      <!-- Toolbar row: actions + filters on the left, search on the right -->
      <div class="vc-table-search-header__toolbar">
        <div v-if="$slots.actions" class="vc-table-search-header__actions">
          <slot name="actions" />
        </div>

        <div
          v-if="$slots.filters || showFilterButton"
          class="vc-table-search-header__filters"
        >
          <VcButton
            variant="outline"
            size="sm"
            icon="fas fa-filter"
            :disabled="disableFilter"
            :class="{ 'vc-table-search-header__filter-button--active': isFilterOpen || activeFilterCount > 0 }"
            @click="toggleFilter"
          >
            <span v-if="filterLabel">{{ filterLabel }}</span>
            <span
              v-if="activeFilterCount > 0"
              class="vc-table-search-header__filter-badge"
            >
              {{ activeFilterCount }}
            </span>
          </VcButton>
        </div>

        <!-- Spacer pushes search to the right -->
        <div class="vc-table-search-header__spacer" />

        <!-- Compact search input (right-aligned, hidden when searchable is false) -->
        <div v-if="searchable" class="vc-table-search-header__search">
          <VcInput
            ref="searchInputRef"
            :model-value="modelValue"
            :placeholder="placeholder"
            size="small"
            clearable
            @update:model-value="handleInput"
          >
            <template #prepend-inner>
              <VcIcon
                icon="fas fa-search"
                size="s"
                class="vc-table-search-header__search-icon"
              />
            </template>
          </VcInput>
        </div>
      </div>

      <!-- Filter panel -->
      <Transition name="filter-panel">
        <div
          v-if="isFilterOpen && $slots.filters"
          class="vc-table-search-header__filter-panel"
        >
          <slot name="filters" :close-panel="closeFilter" />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, useSlots } from "vue";
import { VcIcon } from "@ui/components/atoms";
import { VcButton } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";

const props = withDefaults(
  defineProps<{
    /**
     * Search input value
     */
    modelValue?: string;
    /**
     * Placeholder text for search input
     */
    placeholder?: string;
    /**
     * Number of active filters
     */
    activeFilterCount?: number;
    /**
     * Whether to disable the filter button
     */
    disableFilter?: boolean;
    /**
     * Label for filter button
     */
    filterLabel?: string;
    /**
     * Whether to show the filter button (even without slots.filters)
     */
    showFilterButton?: boolean;
    /**
     * Whether the search input is shown
     */
    searchable?: boolean;
    /**
     * Whether the header is visible
     */
    visible?: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "Search...",
    activeFilterCount: 0,
    disableFilter: false,
    showFilterButton: false,
    searchable: true,
    visible: true,
  },
);

const emit = defineEmits<{
  /** Emitted when search input value changes */
  "update:modelValue": [value: string];
  /** Emitted when filter panel is toggled */
  filterToggle: [isOpen: boolean];
}>();

const slots = useSlots();
const searchInputRef = ref<InstanceType<typeof VcInput> | null>(null);
const isFilterOpen = ref(false);

const handleInput = (value: string | number | null | undefined) => {
  emit("update:modelValue", (value as string) ?? "");
};

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value;
  emit("filterToggle", isFilterOpen.value);
};

const closeFilter = () => {
  isFilterOpen.value = false;
  emit("filterToggle", false);
};

// Expose for parent access
defineExpose({
  focus: () => (searchInputRef.value as any)?.focus?.(),
  closeFilter,
});
</script>

<style lang="scss">
.vc-table-search-header {
  @apply tw-flex tw-flex-col tw-border-b tw-border-solid;
  background-color: var(--table-header-bg, var(--neutrals-50));
  border-color: var(--table-header-border, var(--neutrals-200));

  &__toolbar {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2;
  }

  &__spacer {
    @apply tw-flex-1;
  }

  &__search {
    @apply tw-flex-shrink-0;
    max-width: 240px;
    width: 100%;
  }

  &__search-icon {
    @apply tw-flex-shrink-0;
    color: var(--table-search-icon, var(--neutrals-400));
  }

  &__actions {
    @apply tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0 tw-flex-grow tw-min-w-0;
  }

  &__filters {
    @apply tw-flex-shrink-0;
  }

  &__filter-button--active {
    background-color: var(--table-filter-active-bg, var(--primary-50)) !important;
    border-color: var(--table-filter-active-border, var(--primary-500)) !important;
    color: var(--table-filter-active-text, var(--primary-700)) !important;
  }

  &__filter-badge {
    @apply tw-flex tw-items-center tw-justify-center tw-min-w-5 tw-h-5 tw-px-1.5 tw-rounded-full tw-text-xs tw-font-semibold;
    background-color: var(--table-filter-badge-bg, var(--primary-500));
    color: var(--table-filter-badge-text, white);
  }

  &__filter-panel {
    @apply tw-border-t tw-border-solid tw-p-4;
    border-color: var(--table-filter-panel-border, var(--neutrals-200));
    background-color: var(--table-filter-panel-bg, white);
  }
}

// Transitions
.search-header-enter-active,
.search-header-leave-active {
  @apply tw-transition-all tw-duration-200 tw-ease-in-out;
}

.search-header-enter-from,
.search-header-leave-to {
  @apply tw-opacity-0 tw-transform tw--translate-y-2;
}

.filter-panel-enter-active,
.filter-panel-leave-active {
  @apply tw-transition-all tw-duration-150 tw-ease-in-out;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  @apply tw-opacity-0 tw-max-h-0 tw-overflow-hidden;
}

.filter-panel-enter-to,
.filter-panel-leave-from {
  @apply tw-opacity-100 tw-max-h-96;
}
</style>
