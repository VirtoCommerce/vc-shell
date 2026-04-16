<template>
  <div
    role="row"
    class="vc-table-composition__row"
    :class="{
      'vc-table-composition__row--selected': selected || active,
      'vc-table-composition__row--clickable': isClickable,
      'vc-table-composition__row--header': variant === 'header',
      'vc-table-composition__row--dragging': isDragging,
      'vc-table-composition__row--reorderable': reorderable,
    }"
    :tabindex="isClickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="isClickable && handleClick($event as unknown as MouseEvent)"
    @keydown.space.prevent="handleSpacePress($event)"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @dragend="handleDragEnd"
    @drop="handleDrop"
  >
    <!-- Drag handle / spacer (shown when showDragHandle is true, even for non-reorderable header rows) -->
    <div
      v-if="showDragHandle"
      class="vc-table-composition__row-drag-handle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <rect
          x="2"
          y="4"
          width="12"
          height="1.5"
          rx="0.75"
        />
        <rect
          x="2"
          y="7.25"
          width="12"
          height="1.5"
          rx="0.75"
        />
        <rect
          x="2"
          y="10.5"
          width="12"
          height="1.5"
          rx="0.75"
        />
      </svg>
    </div>
    <TransitionGroup
      tag="div"
      :name="isColumnReordering ? 'vc-table-col-swap' : ''"
      class="vc-table-composition__row-transition-wrapper"
      :style="{ '--filler-width': fillerWidth.value > 0 ? `${fillerWidth.value}px` : '0px' }"
    >
      <slot />
    </TransitionGroup>
    <!-- Row actions: overlay mode (absolute positioned, current behavior) -->
    <slot
      v-if="actionsPosition !== 'column'"
      name="actions"
    />

    <!-- Row actions: column mode (fixed zone, always visible) -->
    <div
      v-if="actionsPosition === 'column'"
      class="vc-table-composition__row-actions-column"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, TransitionGroup, type Ref, type ComputedRef } from "vue";
import { TableContextKey, FillerWidthKey, IsColumnReorderingKey } from "@ui/components/organisms/vc-data-table/keys";

const props = withDefaults(
  defineProps<{
    /**
     * Whether the row is selected
     */
    selected?: boolean;
    /**
     * Whether the row is the active (highlighted) row — visual only, does not affect checkbox
     */
    active?: boolean;
    /**
     * Row variant
     */
    variant?: "default" | "header";
    /**
     * Row index (for actions)
     */
    index?: number;
    /**
     * Whether row is reorderable
     */
    reorderable?: boolean;
    /**
     * Whether to show drag handle icon
     */
    showDragHandle?: boolean;
    /**
     * Whether the row is clickable (adds cursor pointer and hover styles)
     */
    clickable?: boolean;
    /**
     * Position of row actions: overlay (absolute) or column (fixed zone)
     */
    actionsPosition?: "overlay" | "column";
  }>(),
  {
    reorderable: false,
    showDragHandle: false,
  },
);

const emit = defineEmits<{
  /** Row clicked */
  click: [event: MouseEvent];
  /** Mouse entered row */
  hover: [index: number];
  /** Mouse left row */
  leave: [];
  /** Mouse down on row */
  mousedown: [event: MouseEvent];
  /** Drag started */
  dragstart: [event: DragEvent];
  /** Drag over row */
  dragover: [event: DragEvent];
  /** Drag left row */
  dragleave: [event: DragEvent];
  /** Drag ended */
  dragend: [event: DragEvent];
  /** Drop on row */
  drop: [event: DragEvent];
  /** Space pressed on focusable row (for selection toggle, distinct from click) */
  "space-press": [event: KeyboardEvent];
}>();

const tableContext = inject(TableContextKey, null);
const fillerWidth = inject(FillerWidthKey, computed(() => 0));
const isColumnReordering = inject(IsColumnReorderingKey, ref(false));
const isDragging = ref(false);

const isClickable = computed(() => {
  return !!props.clickable;
});

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};

const handleSpacePress = (event: KeyboardEvent) => {
  if (isClickable.value) {
    emit("space-press", event);
  }
};

const handleMouseEnter = () => {
  if (props.index !== undefined) {
    // Update table context if available
    if (tableContext) {
      tableContext.setSelectedRowIndex(props.index);
    }
    // Always emit the event so parent can handle hover state
    emit("hover", props.index);
  }
};

const handleMouseLeave = () => {
  // Update table context if available
  if (tableContext) {
    tableContext.setSelectedRowIndex(undefined);
  }
  // Always emit the event
  emit("leave");
};

const handleMouseDown = (event: MouseEvent) => {
  if (props.reorderable) {
    emit("mousedown", event);
  }
};

const handleDragStart = (event: DragEvent) => {
  if (props.reorderable) {
    isDragging.value = true;
    emit("dragstart", event);
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.reorderable) {
    event.preventDefault();
    emit("dragover", event);
  }
};

const handleDragLeave = (event: DragEvent) => {
  if (props.reorderable) {
    emit("dragleave", event);
  }
};

const handleDragEnd = (event: DragEvent) => {
  if (props.reorderable) {
    isDragging.value = false;
    emit("dragend", event);
  }
};

const handleDrop = (event: DragEvent) => {
  if (props.reorderable) {
    event.preventDefault();
    emit("drop", event);
  }
};
</script>

<style lang="scss">
.vc-table-composition__row {
  @apply tw-relative tw-flex tw-items-center tw-gap-2 tw-py-1 tw-px-4 tw-transition-colors;
  // Width is determined by flex children, min-width ensures row fills container
  min-width: 100%;
  min-height: 53px;
  color: var(--table-text-color);

  &--clickable {
    @apply tw-cursor-pointer;

    &:hover {
      background-color: var(--table-row-bg-hover);
    }
  }

  &--selected {
    background-color: var(--table-row-bg-selected);
  }

  &--header {
    @apply tw-font-medium tw-sticky tw-top-0 tw-z-[var(--z-local-above)];
    background-color: var(--table-header-bg);
    color: var(--table-header-text-color);
    border-bottom: 1px solid var(--table-header-border-color);
    @apply tw-py-0 #{!important};

    // Hide drag handle icon in header — it's only a spacer for layout alignment with body rows
    .vc-table-composition__row-drag-handle {
      visibility: hidden;
    }
  }

  &--reorderable {
    @apply tw-cursor-grab;

    &:active {
      @apply tw-cursor-grabbing;
    }
  }

  &--dragging {
    @apply tw-relative;
    z-index: var(--z-local-sticky);
    background-color: var(--primary-50) !important;
    box-shadow:
      0 4px 12px -2px rgba(0, 0, 0, 0.12),
      0 0 0 1px var(--primary-200) !important;
    border-radius: 6px !important;
    transform: scale(1.01) !important;
    cursor: grabbing !important;
    transition:
      box-shadow 0.15s ease,
      transform 0.15s ease,
      background-color 0.15s ease;
  }

  &-drag-handle {
    @apply tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-flex-shrink-0 tw-rounded;
    cursor: inherit; // Inherit from row (grab when reorderable, default otherwise)
    color: var(--table-drag-handle-color, var(--neutrals-400));
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: var(--table-drag-handle-color-hover, var(--neutrals-600));
      background-color: var(--neutrals-100);
    }
  }

  &-transition-wrapper {
    @apply tw-flex tw-items-center;
    // No inter-column gap — spacing is handled exclusively by cell padding
    // (--table-cell-padding-x in TableHead/TableCell). This ensures header and
    // body columns always align, matching the ag-grid approach.
    gap: 0;
    // Critical: min-width: 0 allows flex children to shrink below content size
    // This enables text truncation/line-clamping in cells
    min-width: 0;
    // flex: 1 with min-width: 0 allows wrapper to fill available space and shrink
    flex: 1 1 0;
    // Note: Do NOT use overflow: hidden here - it clips positioned elements
    // like dropdown menus. Individual cells handle their own overflow.

    // Filler pseudo-element absorbs leftover space computed by the weight engine.
    // Width is controlled via --filler-width CSS variable set on the element.
    &::after {
      content: "";
      flex: 0 0 var(--filler-width, 0px);
      min-width: 0;
    }
  }

  &-actions-column {
    @apply tw-flex tw-items-center tw-justify-end tw-flex-shrink-0;
    min-width: 40px;
  }
}

/* FLIP move animation for column reorder */
.vc-table-col-swap-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.vc-table-col-swap-enter-active,
.vc-table-col-swap-leave-active {
  transition: none !important;
}
</style>
