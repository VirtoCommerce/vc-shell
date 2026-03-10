<template>
  <div
    class="vc-table-composition__group-header"
    :class="{
      'vc-table-composition__group-header--expandable': expandable,
      'vc-table-composition__group-header--expanded': expanded,
      'vc-table-composition__group-header--collapsed': !expanded,
    }"
    @click="handleClick"
  >
    <div class="vc-table-composition__group-header-content">
      <!-- Expand/Collapse toggle button -->
      <VcButton
        v-if="expandable"
        variant="ghost"
        size="icon-sm"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'Collapse group' : 'Expand group'"
        @click.stop="handleToggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="vc-table-composition__group-toggle-icon"
          :class="{ 'vc-table-composition__group-toggle-icon--expanded': expanded }"
        >
          <path d="M6 4l4 4-4 4V4z" />
        </svg>
      </VcButton>

      <!-- Group header content slot or default -->
      <div class="vc-table-composition__group-header-label">
        <slot>
          <span class="vc-table-composition__group-header-key">{{ groupKey }}</span>
          <span class="vc-table-composition__group-header-count">({{ count }})</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "@ui/components/atoms/vc-button";

defineProps<{
  /** The group key (value of the grouping field) */
  groupKey: string;
  /** Number of items in this group */
  count: number;
  /** Whether the group can be expanded/collapsed */
  expandable?: boolean;
  /** Whether the group is currently expanded */
  expanded?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted when toggle button is clicked */
  toggle: [event: MouseEvent];
  /** Emitted when group header row is clicked */
  click: [event: MouseEvent];
}>();

const handleToggle = (event: Event) => {
  emit("toggle", event as MouseEvent);
};

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<style lang="scss">
.vc-table-composition__group-header {
  @apply tw-relative tw-flex tw-items-center tw-w-full;
  background-color: var(--vc-table-group-header-bg, var(--neutrals-50));
  border-bottom: 1px solid var(--table-border-color, var(--neutrals-200));

  &--expandable {
    @apply tw-cursor-pointer;

    &:hover {
      background-color: var(--vc-table-group-header-bg-hover, var(--neutrals-200));
    }
  }

  &-content {
    @apply tw-flex tw-items-center tw-gap-2 tw-py-3 tw-px-4 tw-w-full;
  }

  &-label {
    @apply tw-flex tw-items-center tw-gap-2 tw-flex-1;
  }

  &-key {
    @apply tw-font-semibold tw-text-sm;
    color: var(--vc-table-group-header-text, var(--neutrals-700));
  }

  &-count {
    @apply tw-text-sm;
    color: var(--vc-table-group-header-count, var(--neutrals-500));
  }
}

.vc-table-composition__group-toggle-icon {
  @apply tw-transition-transform tw-duration-200;

  &--expanded {
    transform: rotate(90deg);
  }
}
</style>
