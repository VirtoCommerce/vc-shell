<template>
  <div
    role="cell"
    class="vc-table-composition__cell"
    :class="cellClass"
    :style="cellStyle"
    :data-column-id="columnId"
  >
    <div
      class="vc-table-composition__cell-content"
      :class="contentClasses"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  /**
   * Column width
   */
  width?: string;
  /**
   * Minimum cell width
   */
  minWidth?: string;
  /**
   * Maximum cell width
   */
  maxWidth?: string;
  /**
   * Text alignment
   */
  align?: "left" | "center" | "right";
  /**
   * Custom CSS class from column config
   */
  cellClass?: string;
  /**
   * Number of lines to clamp text to (0 = no clamp, undefined = default 2 line clamp)
   */
  lineClamp?: number;
  /**
   * Column ID for resize tracking
   */
  columnId?: string;
}>();

// Default line clamp when not specified (matches VcColumn default)
const DEFAULT_LINE_CLAMP = 2;

const effectiveLineClamp = computed(() => props.lineClamp ?? DEFAULT_LINE_CLAMP);

// Truncation/clamp classes go on the INNER content wrapper (not the outer flex cell)
// so that text-overflow: ellipsis works correctly on block-level content.
const contentClasses = computed(() => {
  const clamp = effectiveLineClamp.value;
  if (clamp === 0) {
    return {};
  }
  if (clamp === 1) {
    return { "vc-table-composition__cell-content--truncate": true };
  }
  if (clamp > 1) {
    return { "vc-table-composition__cell-content--line-clamp": true };
  }
  return {};
});

// Outer cell: handles flex sizing, alignment, padding
const cellStyle = computed(() => {
  return {
    width: props.width,
    minWidth: props.minWidth || undefined,
    maxWidth: props.maxWidth,
    textAlign: props.align,
    // Columns with width: fixed basis, no grow, can shrink when crowded.
    // The row's ::after filler absorbs any leftover space instead of flex-grow.
    // Columns without width share remaining space equally from 0.
    flex: props.width ? "0 1 auto" : "1 1 0",
  } as Record<string, string | number | undefined>;
});

// Inner content: line-clamp CSS variable
const contentStyle = computed(() => {
  const clamp = effectiveLineClamp.value;
  if (clamp > 1) {
    return { "--line-clamp": clamp } as Record<string, string | number>;
  }
  return undefined;
});
</script>

<style lang="scss">
.vc-table-composition__cell {
  @apply tw-flex tw-items-center tw-text-sm tw-px-1;
  // Allow flex items to shrink below content width
  min-width: 0;
  color: var(--table-text-color);
  // Prevent width/flex animation during container resize (blade expand/collapse)
  transition: none;
}

// Inner content wrapper — fills cell and handles text clipping.
// Separated from the flex cell so that text-overflow/line-clamp works on
// all content (including custom slot content that doesn't add its own truncation).
.vc-table-composition__cell-content {
  flex: 1 1 0;
  min-width: 0;
}

// Ensure inner renderers (including custom slot roots) can shrink with the cell.
// Without this, intrinsic-width content (e.g. inline-flex badges) can overflow
// and bypass effective ellipsis/line-clamp behavior.
.vc-table-composition__cell-content--truncate > *,
.vc-table-composition__cell-content--line-clamp > * {
  min-width: 0;
  max-width: 100%;
}

.vc-table-composition__cell-content--truncate > * *,
.vc-table-composition__cell-content--line-clamp > * * {
  min-width: 0;
}

.vc-table-composition__cell-content--truncate > .vc-status,
.vc-table-composition__cell-content--line-clamp > .vc-status {
  width: 100%;
  max-width: 100%;
}

// Single-line truncation with ellipsis
.vc-table-composition__cell-content--truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Multi-line clamp (e.g. 2 or 3 lines)
// IMPORTANT: line-clamp must be on the CHILD element (where text lives), not the parent.
// -webkit-line-clamp on a parent with -webkit-box counts children as box items, not visual
// text lines. A single <span> child = 1 item, so line-clamp: 2 never activates.
.vc-table-composition__cell-content--line-clamp {
  overflow: hidden; // Safety: clip anything that escapes the child's own clamp
}

// Apply line-clamp directly on the cell renderer element (span/div)
.vc-table-composition__cell-content--line-clamp > * {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--line-clamp, 2);
  overflow: hidden;
  // Override white-space:nowrap from tw-truncate so text can wrap for multi-line clamp
  white-space: normal;
}
</style>
