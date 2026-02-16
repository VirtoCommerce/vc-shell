<template>
  <div
    role="row"
    class="vc-table-composition__row"
    :class="{
      'vc-table-composition__row--selected': selected,
      'vc-table-composition__row--clickable': isClickable,
      'vc-table-composition__row--header': variant === 'header',
      'vc-table-composition__row--dragging': isDragging,
      'vc-table-composition__row--reorderable': reorderable,
    }"
    @click="handleClick"
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
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="4" width="12" height="1.5" rx="0.75"/>
        <rect x="2" y="7.25" width="12" height="1.5" rx="0.75"/>
        <rect x="2" y="10.5" width="12" height="1.5" rx="0.75"/>
      </svg>
    </div>
    <TransitionGroup tag="div" name="vc-table-col-swap" class="vc-table-composition__row-transition-wrapper" :class="{ 'vc-table-composition__row-transition-wrapper--no-filler': hasFlexColumns }">
      <slot />
    </TransitionGroup>
    <!-- Row actions slot - rendered outside TransitionGroup for proper positioning -->
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, TransitionGroup, type Ref } from "vue";

const props = withDefaults(
  defineProps<{
    /**
     * Whether the row is selected
     */
    selected?: boolean;
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
}>();

const tableContext = inject<{
  selectedRowIndex: { value: number | undefined };
  setSelectedRowIndex: (index: number | undefined) => void;
} | null>("tableContext", null);
const hasFlexColumns = inject<Ref<boolean>>("hasFlexColumns", ref(false));
const isDragging = ref(false);

const isClickable = computed(() => {
  return !!props.clickable;
});

const handleClick = (event: MouseEvent) => {
  emit("click", event);
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
  @apply tw-relative tw-flex tw-items-center tw-gap-4 tw-py-1 tw-px-4 tw-transition-colors;
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
    @apply tw-font-medium tw-sticky tw-top-0 tw-z-[1];
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
    z-index: 10 !important;
    background-color: var(--primary-50, #eff6ff) !important;
    box-shadow:
      0 4px 12px -2px rgba(0, 0, 0, 0.12),
      0 0 0 1px var(--primary-200, #bfdbfe) !important;
    border-radius: 6px !important;
    transform: scale(1.01) !important;
    cursor: grabbing !important;
    transition: box-shadow 0.15s ease, transform 0.15s ease, background-color 0.15s ease;
  }

  &-drag-handle {
    @apply tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-flex-shrink-0 tw-rounded;
    cursor: inherit; // Inherit from row (grab when reorderable, default otherwise)
    color: var(--table-drag-handle-color, var(--neutrals-400));
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: var(--table-drag-handle-color-hover, var(--neutrals-600));
      background-color: var(--neutrals-100, #f5f5f5);
    }
  }

  &-transition-wrapper {
    @apply tw-flex tw-items-center;
    // Inherit parent row's gap
    gap: inherit;
    // Critical: min-width: 0 allows flex children to shrink below content size
    // This enables text truncation/line-clamping in cells
    min-width: 0;
    // flex: 1 with min-width: 0 allows wrapper to fill available space and shrink
    flex: 1 1 0;
    // Note: Do NOT use overflow: hidden here - it clips positioned elements
    // like dropdown menus. Individual cells handle their own overflow.

    // Filler pseudo-element absorbs leftover space when ALL columns have fixed widths.
    // Columns with width use flex: 0 1 auto (no grow, can shrink), and this filler fills
    // any remaining width — preventing visual jumps after resize.
    // Negative margin cancels the inherited gap (tw-gap-4 = 1rem) before the filler,
    // so it doesn't steal 16px of column space when appearing after hasFlexColumns→false.
    &::after {
      content: "";
      flex: 1 1 0;
      min-width: 0;
      margin-left: -1rem;
    }

    // When flex-grow columns exist, disable the filler so it doesn't compete for space
    &--no-filler::after {
      display: none;
    }
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
