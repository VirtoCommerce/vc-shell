<template>
  <VcSidebar
    :model-value="open"
    position="bottom"
    size="sm"
    draggable
    drag-handle
    :close-button="false"
    :title="title"
    :inset="false"
    @update:model-value="!$event && handleClose()"
    @close="handleClose"
  >
    <!-- Actions list -->
    <div class="vc-mobile-action-sheet__actions">
      <button
        v-for="action in actions"
        :key="action.id"
        class="vc-mobile-action-sheet__action"
        :class="[
          `vc-mobile-action-sheet__action--${action.type || 'default'}`,
          { 'vc-mobile-action-sheet__action--disabled': action.disabled },
        ]"
        :disabled="action.disabled"
        @click="handleActionClick(action)"
      >
        <VcIcon
          :icon="action.icon"
          class="vc-mobile-action-sheet__action-icon"
        />
        <span class="vc-mobile-action-sheet__action-title">{{ action.title }}</span>
      </button>
    </div>

    <template #footer>
      <div class="vc-mobile-action-sheet__cancel">
        <button
          class="vc-mobile-action-sheet__cancel-btn"
          @click="handleClose"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </template>
  </VcSidebar>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * MobileActionSheet - iOS-style bottom sheet for action overflow
 *
 * Thin wrapper around VcSidebar(position="bottom") with swipe-to-dismiss.
 * Displays when there are more than 2 swipe actions on a mobile card.
 */
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import type { MobileSwipeAction } from "@ui/components/organisms/vc-table/types";

const props = withDefaults(
  defineProps<{
    /** Whether sheet is open */
    open: boolean;
    /** Sheet title */
    title?: string;
    /** Actions to display */
    actions: MobileSwipeAction<T>[];
    /** Cancel button label */
    cancelLabel?: string;
  }>(),
  {
    title: undefined,
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  /** Close the sheet */
  close: [];
  /** Action was clicked */
  action: [action: MobileSwipeAction<T>];
}>();

function handleClose() {
  emit("close");
}

function handleActionClick(action: MobileSwipeAction<T>) {
  if (action.disabled) return;
  emit("action", action);
  emit("close");
}
</script>

<style lang="scss">
:root {
  --action-sheet-border: var(--neutrals-200);
  --action-sheet-action-color: var(--primary-700);
  --action-sheet-action-hover: var(--neutrals-100);
  --action-sheet-action-danger: var(--danger-600);
  --action-sheet-action-success: var(--success-600);
  --action-sheet-action-warning: var(--warning-600);
  --action-sheet-cancel-bg: var(--additional-50);
  --action-sheet-cancel-color: var(--primary-600);
}

.vc-mobile-action-sheet {
  &__actions {
    @apply tw-border-t tw-border-[var(--action-sheet-border)];
  }

  &__action {
    @apply tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-5 tw-py-4 tw-text-left
           tw-border-b tw-border-[var(--action-sheet-border)] tw-transition-colors tw-bg-transparent tw-border-x-0 tw-border-t-0 tw-cursor-pointer
           hover:tw-bg-[var(--action-sheet-action-hover)]
           active:tw-bg-[var(--action-sheet-action-hover)];

    &:last-child {
      @apply tw-border-b-0;
    }

    &--default {
      @apply tw-text-[var(--action-sheet-action-color)];
    }

    &--danger {
      @apply tw-text-[var(--action-sheet-action-danger)];
    }

    &--success {
      @apply tw-text-[var(--action-sheet-action-success)];
    }

    &--warning {
      @apply tw-text-[var(--action-sheet-action-warning)];
    }

    &--disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed tw-pointer-events-none;
    }
  }

  &__action-icon {
    @apply tw-text-xl tw-flex-shrink-0;
  }

  &__action-title {
    @apply tw-text-base tw-font-medium;
  }

  &__cancel {
    @apply tw-p-3;
  }

  &__cancel-btn {
    @apply tw-w-full tw-py-4 tw-text-center tw-text-base tw-font-semibold tw-border-0
           tw-text-[var(--action-sheet-cancel-color)]
           tw-bg-[var(--action-sheet-cancel-bg)]
           tw-rounded-xl tw-transition-colors tw-cursor-pointer
           hover:tw-bg-[var(--action-sheet-action-hover)]
           active:tw-bg-[var(--action-sheet-action-hover)];
  }
}
</style>
