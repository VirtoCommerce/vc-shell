<template>
  <VcTooltip
    class="vc-data-table__header-title"
    :disabled="!isTruncated"
    placement="top"
  >
    <span
      ref="textEl"
      class="vc-data-table__header-title-text"
    >
      <span
        v-if="isEditing && required"
        class="tw-text-danger-500 tw-mr-0.5"
        aria-hidden="true"
        >*</span
      >{{ title }}</span
    >
    <template #tooltip>
      {{ title }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
/**
 * HeaderTitle - default column header title with a "truncation tooltip".
 *
 * The title text is clipped with an ellipsis when the column is too narrow.
 * To let users read the full name without widening the column, a styled
 * VcTooltip is shown on hover — but only while the text is actually truncated.
 *
 * Truncation is detected reactively via ResizeObserver (compares scrollWidth
 * vs clientWidth), so it stays correct as columns are resized. This avoids the
 * race that an on-hover check would have with VcTooltip's own mouseenter, which
 * reads the `disabled` prop synchronously.
 */
import { ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { VcTooltip } from "@ui/components/atoms";

const props = defineProps<{
  /** Column title text */
  title?: string;
  /** Whether the column is required (shows a `*` marker while editing) */
  required?: boolean;
  /** Whether the table is in inline editing mode */
  isEditing?: boolean;
}>();

const textEl = ref<HTMLElement | null>(null);
const isTruncated = ref(false);

const checkTruncation = () => {
  const el = textEl.value;
  isTruncated.value = !!el && el.scrollWidth > el.clientWidth;
};

// Width changes (column resize) re-trigger the observer.
useResizeObserver(textEl, checkTruncation);
// Content changes (title / required marker) don't always change the box size,
// so re-check explicitly after the DOM updates.
watch(
  () => [props.title, props.required, props.isEditing],
  () => requestAnimationFrame(checkTruncation),
);
</script>

<style lang="scss">
.vc-data-table__header-title {
  // VcTooltip root acts as the flex child of `.vc-data-table__header-content`.
  // min-width: 0 lets it shrink below content so the text can truncate.
  @apply tw-flex-1 tw-min-w-0;

  .vc-tooltip__trigger {
    @apply tw-block tw-min-w-0;
  }
}

.vc-data-table__header-title-text {
  @apply tw-block tw-truncate;
}
</style>
