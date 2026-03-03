<template>
  <div
    v-if="$isMobile.value"
    class="app-bar-mobile-actions"
  >
    <div
      v-for="button in getButtons"
      :key="button.id"
      class="app-bar-mobile-actions__button-wrap"
    >
      <VcButton
        v-if="button.isVisible !== undefined ? button.isVisible : true"
        text
        class="app-bar-mobile-actions__button"
        :class="{ 'app-bar-mobile-actions__button--active': button.id === currentAction?.id }"
        :icon="button.icon"
        icon-size="l"
        @click="handleButtonClick(button)"
      />
      <span
        v-if="isBadgeActive(button)"
        class="app-bar-mobile-actions__badge"
      />
    </div>

    <VcSidebar
      :model-value="isAnyActionVisible && !!currentAction?.component"
      position="bottom"
      size="sm"
      draggable
      drag-handle
      :close-button="false"
      :inset="false"
      @update:model-value="!$event && handleClose()"
    >
      <component
        :is="currentAction?.component"
        v-if="currentAction?.component"
        v-bind="currentAction?.props || {}"
        @close="handleClose()"
      />
    </VcSidebar>
  </div>
</template>

<script lang="ts" setup>
import { VcButton } from "@ui/components/atoms/vc-button";
import { useAppBarMobileButtons } from "@core/composables/useAppBarMobileButtons";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";
import { useAppBarMobileActions } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarMobileActions";
import { type MaybeRef, toValue, watch } from "vue";
import type { AppBarButtonContent } from "@core/services/app-bar-mobile-buttons-service";
import { useRoute } from "vue-router";
export interface Props {
  isSidebarMode: boolean;
  expanded: MaybeRef<boolean>;
}

const props = defineProps<Props>();

const { getButtons } = useAppBarMobileButtons();
const { currentAction, toggleAction, hideAllActions, isAnyActionVisible } = useAppBarMobileActions();
const route = useRoute();

const handleButtonClick = (button: AppBarButtonContent) => {
  // If the current button is already active - hide it
  if (currentAction.value?.id === button.id) {
    button.onClose?.();
    hideAllActions();
    return;
  }

  // If the previous active button exists - close it
  if (currentAction.value) {
    currentAction.value.onClose?.();
  }

  // Enable the new button
  toggleAction(button.id);

  // Call onClick for a button without a component
  if (!button.component && button.onClick) {
    button.onClick();
  }
};

const handleClose = (value?: AppBarButtonContent | Event) => {
  if (value && typeof value === "object" && "id" in value) {
    (value as AppBarButtonContent).onClose?.();
  } else {
    currentAction.value?.onClose?.();
  }
  hideAllActions();
};

function isBadgeActive(button: AppBarButtonContent): boolean {
  if (button.badge === undefined) return false;
  return !!toValue(button.badge);
}

// Hide actions on route change or sidebar mode toggle
watch([() => route.fullPath, () => props.isSidebarMode], () => {
  hideAllActions();
});
</script>

<style lang="scss">
.app-bar-mobile-actions {
  @apply tw-relative tw-flex tw-flex-row tw-gap-[30px];

  &__button-wrap {
    @apply tw-relative;
  }

  &__button {
    @apply tw-cursor-pointer tw-text-[var(--app-bar-header-actions-button-color)] #{!important};

    &--active {
      @apply tw-text-[var(--app-bar-header-actions-button-active-color)] #{!important};
    }
  }

  &__badge {
    @apply tw-absolute tw-right-0 tw-top-0 tw-w-[5px] tw-h-[5px] tw-rounded-full tw-z-[1] tw-pointer-events-none;
    background-color: var(--app-bar-accent-color, var(--danger-500));
  }
}
</style>
