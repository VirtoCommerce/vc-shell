<template>
  <TransitionRoot
    appear
    :show="open"
    as="template"
  >
    <Dialog
      as="div"
      class="vc-mobile-action-sheet"
      @close="handleClose"
    >
      <!-- Backdrop with blur -->
      <TransitionChild
        as="template"
        enter="vc-mobile-action-sheet__backdrop-enter"
        enter-from="vc-mobile-action-sheet__backdrop-enter-from"
        enter-to="vc-mobile-action-sheet__backdrop-enter-to"
        leave="vc-mobile-action-sheet__backdrop-leave"
        leave-from="vc-mobile-action-sheet__backdrop-leave-from"
        leave-to="vc-mobile-action-sheet__backdrop-leave-to"
      >
        <div class="vc-mobile-action-sheet__backdrop" />
      </TransitionChild>

      <!-- Sheet container -->
      <div class="vc-mobile-action-sheet__container">
        <TransitionChild
          as="template"
          enter="vc-mobile-action-sheet__sheet-enter"
          enter-from="vc-mobile-action-sheet__sheet-enter-from"
          enter-to="vc-mobile-action-sheet__sheet-enter-to"
          leave="vc-mobile-action-sheet__sheet-leave"
          leave-from="vc-mobile-action-sheet__sheet-leave-from"
          leave-to="vc-mobile-action-sheet__sheet-leave-to"
        >
          <DialogPanel
            ref="sheetRef"
            class="vc-mobile-action-sheet__panel"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <!-- Drag handle -->
            <div class="vc-mobile-action-sheet__handle">
              <div class="vc-mobile-action-sheet__handle-bar" />
            </div>

            <!-- Title -->
            <DialogTitle
              v-if="title"
              class="vc-mobile-action-sheet__title"
            >
              {{ title }}
            </DialogTitle>

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

            <!-- Cancel button -->
            <div class="vc-mobile-action-sheet__cancel">
              <button
                class="vc-mobile-action-sheet__cancel-btn"
                @click="handleClose"
              >
                {{ cancelLabel }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * MobileActionSheet - iOS-style bottom sheet for action overflow
 *
 * Displays when there are more than 2 swipe actions on a mobile card.
 * Features:
 * - Slide-up animation from bottom
 * - Semi-transparent backdrop with blur
 * - Swipe down to dismiss
 * - Cancel button at bottom
 */
import { ref } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import type { MobileSwipeAction } from "../../types";

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
  }
);

const emit = defineEmits<{
  /** Close the sheet */
  close: [];
  /** Action was clicked */
  action: [action: MobileSwipeAction<T>];
}>();

// Touch handling for swipe-to-dismiss
const sheetRef = ref<InstanceType<typeof DialogPanel> | null>(null);
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);

function handleClose() {
  emit("close");
}

function handleActionClick(action: MobileSwipeAction<T>) {
  if (action.disabled) return;
  emit("action", action);
  emit("close");
}

// Swipe down to dismiss logic
function handleTouchStart(event: TouchEvent) {
  touchStartY.value = event.touches[0].clientY;
  touchCurrentY.value = event.touches[0].clientY;
  isDragging.value = true;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  touchCurrentY.value = event.touches[0].clientY;

  const delta = touchCurrentY.value - touchStartY.value;
  // Only allow dragging down
  if (delta > 0 && sheetRef.value?.$el) {
    sheetRef.value.$el.style.transform = `translateY(${delta}px)`;
  }
}

function handleTouchEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;

  const delta = touchCurrentY.value - touchStartY.value;
  // If dragged more than 100px down, close the sheet
  if (delta > 100) {
    handleClose();
  }

  // Reset transform
  if (sheetRef.value?.$el) {
    sheetRef.value.$el.style.transform = "";
  }
}
</script>

<style lang="scss">
:root {
  --action-sheet-bg: var(--additional-50);
  --action-sheet-backdrop: rgb(from var(--neutrals-900) r g b / 50%);
  --action-sheet-handle-bg: var(--neutrals-300);
  --action-sheet-title-color: var(--neutrals-500);
  --action-sheet-border: var(--neutrals-200);
  --action-sheet-action-color: var(--primary-700);
  --action-sheet-action-hover: var(--neutrals-100);
  --action-sheet-action-danger: var(--danger-600);
  --action-sheet-action-success: var(--success-600);
  --action-sheet-action-warning: var(--warning-600);
  --action-sheet-action-disabled: var(--neutrals-400);
  --action-sheet-cancel-bg: var(--additional-50);
  --action-sheet-cancel-color: var(--primary-600);
}

.vc-mobile-action-sheet {
  @apply tw-relative tw-z-50;

  &__backdrop {
    @apply tw-fixed tw-inset-0 tw-bg-[var(--action-sheet-backdrop)] tw-backdrop-blur-sm;
  }

  &__container {
    @apply tw-fixed tw-inset-0 tw-flex tw-items-end tw-justify-center;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  &__panel {
    @apply tw-w-full tw-max-w-lg tw-bg-[var(--action-sheet-bg)] tw-rounded-t-2xl tw-overflow-hidden tw-shadow-2xl;
    touch-action: none;
  }

  &__handle {
    @apply tw-flex tw-justify-center tw-py-3;
  }

  &__handle-bar {
    @apply tw-w-10 tw-h-1 tw-bg-[var(--action-sheet-handle-bg)] tw-rounded-full;
  }

  &__title {
    @apply tw-text-center tw-text-sm tw-font-medium tw-text-[var(--action-sheet-title-color)] tw-pb-3 tw-px-4;
  }

  &__actions {
    @apply tw-border-t tw-border-[var(--action-sheet-border)];
  }

  &__action {
    @apply tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-5 tw-py-4 tw-text-left
           tw-border-b tw-border-[var(--action-sheet-border)] tw-transition-colors
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
    @apply tw-mt-2 tw-mx-3 tw-mb-3;
  }

  &__cancel-btn {
    @apply tw-w-full tw-py-4 tw-text-center tw-text-base tw-font-semibold
           tw-text-[var(--action-sheet-cancel-color)]
           tw-bg-[var(--action-sheet-cancel-bg)]
           tw-rounded-xl tw-transition-colors
           hover:tw-bg-[var(--action-sheet-action-hover)]
           active:tw-bg-[var(--action-sheet-action-hover)];
  }

  // Backdrop animations
  &__backdrop-enter {
    @apply tw-duration-300 tw-ease-out;
  }

  &__backdrop-enter-from {
    @apply tw-opacity-0;
  }

  &__backdrop-enter-to {
    @apply tw-opacity-100;
  }

  &__backdrop-leave {
    @apply tw-duration-200 tw-ease-in;
  }

  &__backdrop-leave-from {
    @apply tw-opacity-100;
  }

  &__backdrop-leave-to {
    @apply tw-opacity-0;
  }

  // Sheet slide-up animations
  &__sheet-enter {
    @apply tw-duration-300 tw-ease-out;
  }

  &__sheet-enter-from {
    @apply tw-translate-y-full tw-opacity-0;
  }

  &__sheet-enter-to {
    @apply tw-translate-y-0 tw-opacity-100;
  }

  &__sheet-leave {
    @apply tw-duration-200 tw-ease-in;
  }

  &__sheet-leave-from {
    @apply tw-translate-y-0 tw-opacity-100;
  }

  &__sheet-leave-to {
    @apply tw-translate-y-full tw-opacity-0;
  }
}
</style>
