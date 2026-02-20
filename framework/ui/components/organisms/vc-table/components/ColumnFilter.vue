<template>
  <div
    ref="filterRef"
    class="vc-column-filter"
  >
    <!-- Filter button -->
    <VcButton
      ref="triggerRef"
      variant="ghost"
      size="icon"
      icon="fas fa-filter"
      icon-size="xs"
      class="vc-column-filter__trigger"
      :class="{ 'vc-column-filter__trigger--active': hasActiveFilter }"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="toggleOverlay"
    />

    <!-- Filter popup overlay -->
    <Teleport to="body">
      <Transition name="vc-column-filter-fade">
        <div
          v-if="isOpen"
          ref="overlayRef"
          class="vc-column-filter__overlay"
          :style="overlayStyle"
          role="dialog"
          aria-modal="true"
          @click.stop
          @keydown="handleOverlayKeydown"
        >
          <!-- Custom filter slot -->
          <div
            v-if="$slots.filter"
            class="vc-column-filter__content"
          >
            <slot
              name="filter"
              :value="localValue"
              :update-value="updateLocalValue"
              :start-date="localStartDate"
              :update-start-date="updateLocalStartDate"
              :end-date="localEndDate"
              :update-end-date="updateLocalEndDate"
              :apply-filter="applyFilter"
              :clear-filter="clearFilter"
            />
          </div>

          <!-- Default filter content by type -->
          <div
            v-else
            class="vc-column-filter__content"
          >
            <!-- Text filter -->
            <div v-if="filterType === 'text'" class="vc-column-filter__input-wrapper">
              <VcInput
                ref="inputRef"
                :model-value="localValue as string"
                :placeholder="placeholder || 'Filter...'"
                size="small"
                @update:model-value="updateLocalValue($event)"
                @keydown.enter="applyFilter"
                @keydown.escape="closeOverlay"
              />
            </div>

            <!-- Select filter -->
            <div v-else-if="filterType === 'select'" class="vc-column-filter__input-wrapper">
              <VcSelect
                :model-value="localValue"
                :options="filterOptions || []"
                option-value="value"
                option-label="label"
                size="small"
                :placeholder="placeholder || ''"
                :multiple="multiple"
                clearable
                emit-value
                @update:model-value="updateLocalValue($event)"
              />
            </div>

            <!-- DateRange filter -->
            <div v-else-if="filterType === 'dateRange'" class="vc-column-filter__range">
              <div class="vc-column-filter__range-field">
                <span class="vc-column-filter__range-label">
                  {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.FROM") }}
                </span>
                <VcInput
                  :model-value="localStartDate"
                  type="date"
                  size="small"
                  @update:model-value="updateLocalStartDate($event as string)"
                />
              </div>
              <div class="vc-column-filter__range-field">
                <span class="vc-column-filter__range-label">
                  {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.TO") }}
                </span>
                <VcInput
                  :model-value="localEndDate"
                  type="date"
                  size="small"
                  @update:model-value="updateLocalEndDate($event as string)"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="vc-column-filter__actions">
            <VcButton
              variant="outline"
              size="sm"
              @click="clearFilter"
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.CLEAR") }}
            </VcButton>
            <VcButton
              variant="primary"
              size="sm"
              @click="applyFilter"
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.COLUMN_FILTER.APPLY") }}
            </VcButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { VcInput, VcSelect } from "@ui/components/molecules";
import { VcButton } from "@ui/components/atoms";
import type { FilterType, FilterOption, FilterValue } from "@ui/components/organisms/vc-table/types";

interface Props {
  /** Backend field name for this filter */
  field: string;
  /** Filter type: text, select, or dateRange */
  filterType: FilterType;
  /** Options array for select filter (value/label pairs) */
  filterOptions?: FilterOption[];
  /** Whether to allow multiple selection for select filter */
  multiple?: boolean;
  /** Field names for dateRange filter: [startField, endField] */
  rangeFields?: [string, string];
  /** Placeholder text for the input */
  placeholder?: string;
  /** Current filter value for showing active state */
  modelValue?: FilterValue;
}

interface Emits {
  /** Emitted when filter is applied with flat payload: { fieldName: value } or { startField: date, endField: date } */
  (e: "apply", payload: Record<string, unknown>): void;
  /** Emitted when filter is cleared */
  (e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
  filterType: "text",
  filterOptions: undefined,
  multiple: false,
  rangeFields: undefined,
  placeholder: undefined,
  modelValue: undefined,
});

const emit = defineEmits<Emits>();

// Refs
const filterRef = ref<HTMLElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const triggerRef = ref<InstanceType<typeof VcButton> | null>(null);
const isOpen = ref(false);

// Local working state (not synced until Apply)
const localValue = ref<FilterValue>(null);
const localStartDate = ref("");
const localEndDate = ref("");

// Initialize local state from modelValue
const initLocalState = () => {
  if (props.filterType === "dateRange" && props.modelValue && typeof props.modelValue === "object" && !Array.isArray(props.modelValue)) {
    const rangeVal = props.modelValue as { start?: string; end?: string };
    localStartDate.value = rangeVal.start ?? "";
    localEndDate.value = rangeVal.end ?? "";
    localValue.value = null;
  } else {
    localValue.value = props.modelValue ?? null;
    localStartDate.value = "";
    localEndDate.value = "";
  }
};

// Update helpers (exposed to slot)
const updateLocalValue = (val: unknown) => {
  localValue.value = val as FilterValue;
};

const updateLocalStartDate = (val: string) => {
  localStartDate.value = val;
};

const updateLocalEndDate = (val: string) => {
  localEndDate.value = val;
};

// Active filter indicator
const hasActiveFilter = computed(() => {
  const val = props.modelValue;
  if (val === null || val === undefined || val === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === "object" && !Array.isArray(val)) {
    // Check if any property has a non-empty value (covers dateRange {start,end}, custom {min,max}, etc.)
    return Object.values(val).some((v) => v !== null && v !== undefined && v !== "");
  }
  return true;
});

// Overlay positioning
const overlayStyle = ref<Record<string, string>>({});

const updateOverlayPosition = () => {
  if (!filterRef.value || !overlayRef.value) return;

  const triggerRect = filterRef.value.getBoundingClientRect();
  const overlayRect = overlayRef.value.getBoundingClientRect();

  let top = triggerRect.bottom + 4;
  let left = triggerRect.left;

  // Adjust if overflow right
  if (left + overlayRect.width > window.innerWidth) {
    left = window.innerWidth - overlayRect.width - 8;
  }

  // Adjust if overflow bottom
  if (top + overlayRect.height > window.innerHeight) {
    top = triggerRect.top - overlayRect.height - 4;
  }

  overlayStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

// Toggle overlay
const toggleOverlay = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    initLocalState();
    nextTick(() => {
      updateOverlayPosition();
      // Focus first focusable element inside the overlay (works for all filter types)
      nextTick(() => {
        const firstFocusable = overlayRef.value?.querySelector<HTMLElement>(
          'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      });
    });
  }
};

const closeOverlay = () => {
  isOpen.value = false;
  // Return focus to trigger button
  nextTick(() => {
    (triggerRef.value as any)?.$el?.focus();
  });
};

// Focus trap: cycle Tab within overlay, Escape closes
const handleOverlayKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeOverlay();
    return;
  }

  if (event.key !== "Tab" || !overlayRef.value) return;

  const focusable = overlayRef.value.querySelectorAll<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

// Build flat payload from local state
const buildPayload = (): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (props.filterType === "dateRange" && props.rangeFields) {
    if (localStartDate.value) {
      payload[props.rangeFields[0]] = localStartDate.value;
    }
    if (localEndDate.value) {
      payload[props.rangeFields[1]] = localEndDate.value;
    }
  } else {
    const val = localValue.value;
    if (val !== null && val !== undefined && val !== "") {
      if (Array.isArray(val) && val.length === 0) {
        // Empty array — skip
      } else {
        payload[props.field] = val;
      }
    }
  }

  return payload;
};

// Apply filter
const applyFilter = () => {
  emit("apply", buildPayload());
  closeOverlay();
};

// Clear filter
const clearFilter = () => {
  localValue.value = null;
  localStartDate.value = "";
  localEndDate.value = "";
  emit("clear");
  closeOverlay();
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return;

  const target = event.target as HTMLElement;
  if (filterRef.value?.contains(target) || overlayRef.value?.contains(target)) {
    return;
  }

  // Don't close if clicking on VcSelect dropdown (teleported to body)
  if (target.closest(".vc-select__dropdown") || target.closest(".vc-select__option")) {
    return;
  }

  closeOverlay();
};

// Sync active state: re-init when overlay reopens
watch(isOpen, (opened) => {
  if (opened) {
    initLocalState();
  }
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", updateOverlayPosition);
  window.addEventListener("scroll", updateOverlayPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", updateOverlayPosition);
  window.removeEventListener("scroll", updateOverlayPosition, true);
});
</script>

<style lang="scss">
.vc-column-filter {
  display: inline-flex;
  align-items: center;

  &__trigger {
    @apply tw-w-6 tw-h-6;
    color: var(--neutrals-400, #9ca3af);

    &--active {
      color: var(--primary-500, #3b82f6);
      background-color: var(--primary-100, #dbeafe);
    }
  }

  &__overlay {
    @apply tw-fixed tw-z-[100] tw-bg-additional-50 tw-rounded-lg tw-shadow-lg tw-border tw-border-neutrals-200;
    min-width: 200px;
    max-width: 300px;
  }

  &__content {
    @apply tw-p-3;
  }

  &__input-wrapper {
    @apply tw-relative;
  }

  &__range {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__range-field {
    @apply tw-space-y-1;
  }

  &__range-label {
    @apply tw-block tw-text-xs tw-text-neutrals-500;
  }

  &__actions {
    @apply tw-flex tw-justify-end tw-gap-2 tw-px-3 tw-py-2 tw-border-t tw-border-neutrals-200 tw-bg-neutrals-50 tw-rounded-b-lg;
  }

}

// Transition
.vc-column-filter-fade-enter-active,
.vc-column-filter-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.vc-column-filter-fade-enter-from,
.vc-column-filter-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
