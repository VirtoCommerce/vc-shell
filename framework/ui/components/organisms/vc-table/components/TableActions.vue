<template>
  <div
    v-show="isVisible && actions && actions.length"
    class="vc-table-composition__actions"
    @click.stop
  >
    <div v-for="(action, idx) in visibleActions" :key="idx" class="vc-table-composition__action">
      <VcTooltip placement="top" :max-width="200" variant="dark">
          <div
            class="vc-table-composition__action-icon"
            :class="{
              'vc-table-composition__action-icon--disabled': action.disabled,
              'vc-table-composition__action-icon--danger': action.variant === 'danger',
            }"
            @click="handleActionClick(action)"
          >
            <VcIcon :icon="action.icon" size="s" />
          </div>
        <template #tooltip>
          {{ action.title || action.name }}
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch, ref } from "vue";
import { VcIcon, VcTooltip } from "@ui/components/atoms";
import { TableContextKey } from "@ui/components/organisms/vc-table/keys";
import type { TableAction } from "@ui/components/organisms/vc-table/types";

const props = defineProps<{
  /**
   * Actions to display
   */
  actions?: TableAction[];
  /**
   * Whether to show actions
   */
  visible?: boolean;
  /**
   * Row index (to check if this row is hovered)
   */
  rowIndex?: number;
}>();

const emit = defineEmits<{
  action: [action: TableAction];
}>();

const tableContext = inject(TableContextKey, null);

const visibleActions = computed(() => {
  return props.actions?.filter((action) => !action.hidden) || [];
});

const isVisible = ref(false);

// Watch for changes in selectedRowIndex
if (tableContext && tableContext.selectedRowIndex) {
  watch(
    () => tableContext.selectedRowIndex.value,
    (newValue) => {
      const shouldBeVisible = props.rowIndex !== undefined && newValue === props.rowIndex;
      isVisible.value = shouldBeVisible;
    },
    { immediate: true }
  );
}

// Also check if visible prop is set
watch(
  () => props.visible,
  (newValue) => {
    if (newValue !== undefined) {
      isVisible.value = newValue;
    }
  },
  { immediate: true }
);

const handleActionClick = (action: TableAction) => {
  if (!action.disabled) {
    emit("action", action);
    if (action.clickHandler) {
      action.clickHandler();
    }
  }
};
</script>

<style lang="scss">
.vc-table-composition__actions {
  @apply tw-absolute tw-flex tw-right-0 tw-px-2.5 tw-h-full tw-items-center tw-gap-2;
  background-color: var(--table-actions-bg, white);
  z-index: 2;
  pointer-events: auto;
  top: 0;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.05); // Add subtle shadow for visibility
}

.vc-table-composition__action-icon {
  @apply tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded tw-cursor-pointer tw-transition-colors;
  color: var(--table-actions-icon-color, #333);
  font-size: 14px;

  &:hover:not(&--disabled) {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--table-actions-icon-color-hover);
  }

  &--disabled {
    @apply tw-opacity-30 tw-cursor-not-allowed;
  }

  &--danger {
    color: var(--table-actions-color-danger);

    &:hover:not(.vc-table-composition__action-icon--disabled) {
      background-color: rgba(255, 74, 74, 0.1);
    }
  }
}
</style>
