<template>
  <div
    class="vc-table-composition__head"
    :class="{
      'vc-table-composition__head--sortable': sortable,
      'vc-table-composition__head--sorted': sortDirection,
      'vc-table-composition__head--resizable': resizable,
      'vc-table-composition__head--reorderable': reorderable,
    }"
    :style="cellStyle"
    :draggable="reorderable"
    :data-column-id="columnId"
    role="columnheader"
    :tabindex="sortable ? 0 : undefined"
    :aria-sort="ariaSort"
    @click="handleSort"
    @keydown.enter="handleSort"
    @keydown.space.prevent="handleSort"
    @mousedown="handleMouseDown"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="vc-table-composition__head-content">
      <slot />
    </div>
    <div v-if="sortable" class="vc-table-composition__head-sort">
      <span v-if="sortIndex" class="vc-table-composition__head-sort-badge">
        {{ sortIndex }}
      </span>
      <VcIcon
        v-if="sortDirection"
        :icon="sortDirection === 'asc' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
        size="xs"
      />
      <VcIcon v-else icon="fas fa-sort" size="xs" class="tw-opacity-30" />
    </div>
    <!-- AG Grid / TanStack style resizer -->
    <div
      v-if="resizable"
      class="vc-table-composition__head-resizer"
      :class="{ 'vc-table-composition__head-resizer--last': isLastResizable }"
      @mousedown.stop.prevent="handleResizerMouseDown"
      @click.stop.prevent
    >
      <div class="vc-table-composition__head-resizer-line" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { VcIcon } from "../../../atoms";

const props = defineProps<{
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  /**
   * Current sort direction
   */
  sortDirection?: "asc" | "desc";
  /**
   * Sort index for multi-sort (1-based, shown as badge when multiple columns sorted)
   */
  sortIndex?: number;
  /**
   * Whether the column is resizable
   */
  resizable?: boolean;
  /**
   * Whether the column can be reordered via drag & drop
   */
  reorderable?: boolean;
  /**
   * Column ID (required for resizable/reorderable columns)
   */
  columnId?: string;
  /**
   * Column width
   */
  width?: string;
  /**
   * Minimum column width
   */
  minWidth?: string;
  /**
   * Maximum column width
   */
  maxWidth?: string;
  /**
   * Text alignment
   */
  align?: "left" | "center" | "right";
  /**
   * Whether this is the last resizable column (offsets resizer from scrollbar)
   */
  isLastResizable?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted when the column header is clicked for sorting */
  sort: [event: Event];
  /** Emitted when column resize begins */
  resizeStart: [columnId: string | undefined, event: MouseEvent];
  /** Emitted when mouse is pressed down for reordering */
  reorderMouseDown: [columnId: string | undefined, event: MouseEvent];
  /** Emitted when column drag starts for reordering */
  reorderDragStart: [columnId: string | undefined, event: DragEvent];
  /** Emitted when dragged column is over this column during reorder */
  reorderDragOver: [event: DragEvent];
  /** Emitted when dragged column leaves this column during reorder */
  reorderDragLeave: [event: DragEvent];
  /** Emitted when dragged column is dropped on this column */
  reorderDrop: [columnId: string | undefined, event: DragEvent];
}>();

const ariaSort = computed<"ascending" | "descending" | "none" | undefined>(() => {
  if (!props.sortable) return undefined;
  if (props.sortDirection === "asc") return "ascending";
  if (props.sortDirection === "desc") return "descending";
  return "none";
});

const cellStyle = computed(() => ({
  width: props.width,
  minWidth: props.minWidth || undefined,
  maxWidth: props.maxWidth,
  textAlign: props.align,
  // Columns with width: fixed basis, no grow, can shrink when crowded.
  // The row's ::after filler absorbs any leftover space instead of flex-grow.
  // Columns without width share remaining space equally from 0.
  flex: props.width ? "0 1 auto" : "1 1 0",
}));

const handleSort = (event: Event) => {
  if (props.sortable) {
    emit("sort", event);
  }
};

const isResizing = ref(false);

const handleResizerMouseDown = (event: MouseEvent) => {
  isResizing.value = true;
  emit("resizeStart", props.columnId, event);

  // Reset resizing flag when mouse is released
  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mouseup", handleMouseUp);
  };
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseDown = (event: MouseEvent) => {
  if (props.reorderable && !isResizing.value) {
    emit("reorderMouseDown", props.columnId, event);
  }
};

const handleDragStart = (event: DragEvent) => {
  // Don't allow drag if resizing
  if (isResizing.value) {
    event.preventDefault();
    return;
  }

  if (props.reorderable) {
    emit("reorderDragStart", props.columnId, event);
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.reorderable) {
    emit("reorderDragOver", event);
  }
};

const handleDragLeave = (event: DragEvent) => {
  if (props.reorderable) {
    emit("reorderDragLeave", event);
  }
};

const handleDrop = (event: DragEvent) => {
  if (props.reorderable) {
    emit("reorderDrop", props.columnId, event);
  }
};
</script>

<style lang="scss">
.vc-table-composition__head {
  @apply tw-relative tw-flex tw-items-center tw-gap-1 tw-font-medium tw-text-sm tw-px-1 tw-h-[60px];
  transition: color 0.2s ease;
  // px-1 + gap-1 match body cells (TableCell) to ensure head and body shrink
  // identically when many columns are visible. With px-3, padding alone was 24px
  // per cell — causing 28 cells to exceed the container and create horizontal scroll.
  min-width: 0;
  // Clip internal overflow (sort icon, content) so it doesn't extend the parent's
  // scrollWidth when many columns compress cells below their content size.
  overflow: hidden;
  color: var(--table-header-text-color);

  &--sortable {
    @apply tw-cursor-pointer;

    &:hover {
      color: var(--primary-600);
    }

    &:focus-visible {
      @apply tw-outline-none tw-ring-2 tw-ring-inset;
      --tw-ring-color: var(--primary-500);
    }
  }

  &--sorted {
    color: var(--primary-700);
  }

  &-content {
    @apply tw-flex-1 tw-truncate;
  }

  &-sort {
    @apply tw-flex tw-items-center tw-gap-1 tw-flex-shrink-0;
    color: var(--table-sort-icon-color);

    .vc-table-composition__head--sorted & {
      color: var(--primary-600);
    }
  }

  &-sort-badge {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-min-w-[16px] tw-h-[16px] tw-px-1 tw-text-[10px] tw-font-semibold tw-rounded-full;
    background-color: var(--primary-100);
    color: var(--primary-700);
  }

  // AG Grid / TanStack style resizer
  &-resizer {
    @apply tw-absolute tw-top-0 tw-right-0 tw-h-full tw-w-1 tw-cursor-col-resize tw-z-10;
    @apply tw-flex tw-items-center tw-justify-center;
    margin-right: -2px; // Center on border

    // Hit area - wider invisible zone for easier grabbing
    &::before {
      content: "";
      @apply tw-absolute tw-inset-0 tw-w-[10px];
      transform: translateX(-4px); // Center the hit area
    }

    &-line {
      @apply tw-h-[60%] tw-w-[2px] tw-rounded-full tw-transition-all tw-duration-200;
      background-color: var(--neutrals-300);
      opacity: 1; // Always visible
    }

    // Change color on hover
    &:hover &-line,
    .vc-table-composition__head--resizing &-line {
      background-color: var(--primary-500);
    }

    // Active state during drag
    &:active &-line {
      background-color: var(--primary-600);
      @apply tw-h-full;
    }

    // Last resizable column — no offset needed, resizer stays at edge
    &--last {
      right: 0;
      margin-right: -2px;
    }
  }

  // When resizing, show cursor everywhere and disable text selection
  &--resizing {
    @apply tw-select-none;
  }

  // Reorderable column styles
  &--reorderable {
    cursor: grab;
    transition: color 0.2s ease-out;

    &:active {
      cursor: grabbing;
    }
  }

  // Style for column being dragged — matches row dragging style
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
}
</style>
