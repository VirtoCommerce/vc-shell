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
import { useTextDirection } from "@core/composables/useTextDirection";

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
  align?: "start" | "center" | "end" | "left" | "right";
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

const { isRtl } = useTextDirection();

// On a right-to-left page the column's side is given in physical terms. The data in a cell reads in its own direction
// (unicode-bidi: plaintext, see the style below), and such a block would read "start" as its own text's start: an
// English name would go to the left of an Arabic table.
const textAlign = computed(() => {
  if (!isRtl.value || props.align === "center") return props.align;
  return props.align === "end" || props.align === "right" ? "left" : "right";
});

// Outer cell: handles flex sizing, alignment, padding
const cellStyle = computed(() => {
  return {
    width: props.width,
    minWidth: props.minWidth || undefined,
    maxWidth: props.maxWidth,
    textAlign: textAlign.value,
    // Engine-provided widths are fixed. Before first compute, keep cells
    // evenly distributed to match headers and avoid initial left-pack flash.
    flex: props.width ? `0 0 ${props.width}` : "1 1 0px",
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
  @apply tw-flex tw-items-center tw-text-sm;
  // Horizontal padding — matches TableHead via shared --table-cell-padding-x variable.
  // This ensures body content aligns exactly with header text.
  padding: 0 var(--table-cell-padding-x);
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

// Data whose direction is its own (emails, codes, versions, URLs, amounts) reads left to right inside a right-to-left
// table, from its first letter, and keeps the column's side (the cell's physical text-align, set in the script).
[dir="rtl"] .vc-table-composition__cell-content :is(div, span, a, p):not(:has(*)) {
  text-align: match-parent;
  unicode-bidi: plaintext;
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
