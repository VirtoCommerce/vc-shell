<template>
  <VcDropdownPanel
    :show="show"
    :anchor-ref="anchorRef"
    :title="$t('COMPONENTS.ORGANISMS.VC_TABLE.GLOBAL_FILTERS.TITLE')"
    width="280px"
    max-width="400px"
    @update:show="emit('update:show', $event)"
  >
    <!-- Filters list -->
    <div class="vc-global-filters-panel__content">
      <div
        v-for="filter in filters"
        :key="filter.id"
        class="vc-global-filters-panel__filter"
      >
        <label class="vc-global-filters-panel__label">{{ filter.label }}</label>

        <!-- Custom filter slot -->
        <slot
          v-if="$slots[`filter-${filter.id}`]"
          :name="`filter-${filter.id}`"
          :value="localValues[filter.id]"
          :update-value="(val: unknown) => updateFilterValue(filter.id, val)"
        />

        <!-- Text filter -->
        <VcInput
          v-else-if="getType(filter.id) === 'text'"
          :model-value="localValues[filter.id] as string"
          :placeholder="filter.placeholder ?? ''"
          size="small"
          @update:model-value="updateFilterValue(filter.id, $event)"
        />

        <!-- Select filter -->
        <VcSelect
          v-else-if="getType(filter.id) === 'select'"
          :model-value="localValues[filter.id]"
          :options="getFilterOptions(filter.filter)"
          option-value="value"
          option-label="label"
          size="small"
          :placeholder="filter.placeholder ?? ''"
          :multiple="isMultipleSelect(filter.filter)"
          clearable
          emit-value
          @update:model-value="updateFilterValue(filter.id, $event)"
        />

        <!-- DateRange filter -->
        <div
          v-else-if="getType(filter.id) === 'dateRange'"
          class="vc-global-filters-panel__range"
        >
          <div class="vc-global-filters-panel__range-field">
            <span class="vc-global-filters-panel__range-label">
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.FROM") }}
            </span>
            <VcInput
              :model-value="getDateRangeStart(filter.id)"
              type="date"
              size="small"
              @update:model-value="updateDateRangeStart(filter, $event)"
            />
          </div>
          <div class="vc-global-filters-panel__range-field">
            <span class="vc-global-filters-panel__range-label">
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.TO") }}
            </span>
            <VcInput
              :model-value="getDateRangeEnd(filter.id)"
              type="date"
              size="small"
              @update:model-value="updateDateRangeEnd(filter, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <template #footer>
      <VcButton
        variant="outline"
        size="sm"
        @click="clearAll"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.CLEAR") }}
      </VcButton>
      <VcButton
        variant="primary"
        size="sm"
        @click="applyAll"
      >
        {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.APPLY") }}
      </VcButton>
    </template>
  </VcDropdownPanel>
</template>

<script setup lang="ts">
/**
 * GlobalFiltersPanel - Dropdown panel with global filters
 *
 * Displays a list of configurable filters with Apply/Clear buttons.
 * Supports text, select (single/multi), and dateRange filter types.
 * Custom filter UI can be provided via named slots.
 * Uses VcDropdownPanel for positioning and backdrop.
 */
import { ref, computed, watch } from "vue";
import { VcDropdownPanel } from "../../../molecules";
import { VcInput, VcSelect } from "../../../molecules";
import { VcButton } from "../../../atoms";
import type { GlobalFilterConfig } from "../types";
import { useColumnFilter } from "../composables/useColumnFilter";

interface Props {
  /** List of filter configurations (id, label, type, options) */
  filters: GlobalFilterConfig[];
  /** Current filter values as key-value pairs (controlled) */
  modelValue: Record<string, unknown>;
  /** Whether panel is visible */
  show: boolean;
  /** Anchor element for positioning the floating panel */
  anchorRef?: HTMLElement | null;
}

const props = withDefaults(defineProps<Props>(), {
  anchorRef: null,
});

const emit = defineEmits<{
  /** Emitted when filter values change */
  "update:modelValue": [Record<string, unknown>];
  /** Emitted to close panel */
  "update:show": [boolean];
  /** Emitted when Apply is clicked */
  apply: [Record<string, unknown>];
  /** Emitted when Clear is clicked */
  clear: [];
}>();

// Use the same helpers as ColumnFilter
const { getFilterType, getFilterOptions, isMultipleSelect, getRangeFields } = useColumnFilter();

// Pre-compute filter types for each filter (for debugging and reactivity)
const filterTypes = computed(() => {
  const types: Record<string, string> = {};
  for (const filter of props.filters) {
    types[filter.id] = getFilterType(filter.filter);
  }
  return types;
});

// Helper to get pre-computed filter type
const getType = (filterId: string) => filterTypes.value[filterId] || "none";

// Local working copy of filter values
const localValues = ref<Record<string, unknown>>({});

// Initialize local values from props
const initLocalValues = () => {
  const values: Record<string, unknown> = {};
  for (const filter of props.filters) {
    values[filter.id] = props.modelValue[filter.id] ?? null;
  }
  localValues.value = values;
};

// Watch for external changes when panel is closed
watch(
  () => props.modelValue,
  () => {
    if (!props.show) {
      initLocalValues();
    }
  },
  { deep: true }
);

// Initialize when panel opens
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      initLocalValues();
    }
  }
);

// Update filter value
const updateFilterValue = (filterId: string, value: unknown) => {
  localValues.value = {
    ...localValues.value,
    [filterId]: value,
  };
};

// DateRange helpers
const getDateRangeStart = (filterId: string): string => {
  const val = localValues.value[filterId];
  if (val && typeof val === "object" && "start" in val) {
    return (val as { start?: string }).start ?? "";
  }
  return "";
};

const getDateRangeEnd = (filterId: string): string => {
  const val = localValues.value[filterId];
  if (val && typeof val === "object" && "end" in val) {
    return (val as { end?: string }).end ?? "";
  }
  return "";
};

const updateDateRangeStart = (filter: GlobalFilterConfig, value: string) => {
  const current = localValues.value[filter.id] as { start?: string; end?: string } | null;
  localValues.value = {
    ...localValues.value,
    [filter.id]: {
      start: value || undefined,
      end: current?.end,
    },
  };
};

const updateDateRangeEnd = (filter: GlobalFilterConfig, value: string) => {
  const current = localValues.value[filter.id] as { start?: string; end?: string } | null;
  localValues.value = {
    ...localValues.value,
    [filter.id]: {
      start: current?.start,
      end: value || undefined,
    },
  };
};

// Build flat payload for backend
const buildPayload = (): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  for (const filter of props.filters) {
    const value = localValues.value[filter.id];
    const filterType = getFilterType(filter.filter);

    if (filterType === "dateRange") {
      // Expand dateRange to separate fields
      const rangeFields = getRangeFields(filter.filter);
      const rangeVal = value as { start?: string; end?: string } | null;
      if (rangeFields && rangeVal) {
        if (rangeVal.start) {
          payload[rangeFields[0]] = rangeVal.start;
        }
        if (rangeVal.end) {
          payload[rangeFields[1]] = rangeVal.end;
        }
      }
    } else {
      // Text and select filters
      if (value !== null && value !== undefined && value !== "") {
        // For multi-select, only include if array has items
        if (Array.isArray(value) && value.length === 0) {
          continue;
        }
        const field = typeof filter.filter === "string" ? filter.filter : filter.id;
        payload[field] = value;
      }
    }
  }

  return payload;
};

// Actions
const close = () => {
  emit("update:show", false);
};

const applyAll = () => {
  const payload = buildPayload();
  emit("update:modelValue", { ...localValues.value });
  emit("apply", payload);
  close();
};

const clearAll = () => {
  // Reset all local values
  const cleared: Record<string, unknown> = {};
  for (const filter of props.filters) {
    cleared[filter.id] = null;
  }
  localValues.value = cleared;
  emit("update:modelValue", cleared);
  emit("clear");
  close();
};
</script>

<style lang="scss">
.vc-global-filters-panel {
  &__content {
    @apply tw-px-4 tw-py-3;
    @apply tw-space-y-4;
  }

  &__filter {
    @apply tw-space-y-1.5;
  }

  &__label {
    @apply tw-block tw-text-sm tw-font-medium tw-text-[color:var(--neutrals-700)];
  }

  &__range {
    @apply tw-flex tw-gap-3;
  }

  &__range-field {
    @apply tw-flex-1 tw-space-y-1;
  }

  &__range-label {
    @apply tw-block tw-text-xs tw-text-[color:var(--neutrals-500)];
  }

}
</style>
