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
      <button
        v-if="expandable"
        type="button"
        class="vc-table-composition__group-toggle"
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
      </button>

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

const handleToggle = (event: MouseEvent) => {
  emit("toggle", event);
};

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<style lang="scss">
.vc-table-composition__group-header {
  @apply tw-relative tw-flex tw-items-center tw-w-full;
  background-color: var(--vc-table-group-header-bg, #f3f4f6);
  border-bottom: 1px solid var(--table-border-color, #e5e7eb);

  &--expandable {
    @apply tw-cursor-pointer;

    &:hover {
      background-color: var(--vc-table-group-header-bg-hover, #e5e7eb);
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
    color: var(--vc-table-group-header-text, #374151);
  }

  &-count {
    @apply tw-text-sm;
    color: var(--vc-table-group-header-count, #6b7280);
  }
}

.vc-table-composition__group-toggle {
  @apply tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-rounded tw-border-0 tw-p-0;
  @apply tw-transition-colors tw-duration-150;
  background-color: transparent;
  color: var(--vc-table-group-toggle-color, #6b7280);

  &:hover {
    background-color: var(--vc-table-group-toggle-bg-hover, rgba(0, 0, 0, 0.05));
    color: var(--vc-table-group-toggle-color-hover, #374151);
  }

  &:focus {
    @apply tw-outline-none;
    box-shadow: 0 0 0 2px var(--primary-200, #bfdbfe);
  }

  &-icon {
    @apply tw-transition-transform tw-duration-200;

    &--expanded {
      transform: rotate(90deg);
    }
  }
}
</style>
