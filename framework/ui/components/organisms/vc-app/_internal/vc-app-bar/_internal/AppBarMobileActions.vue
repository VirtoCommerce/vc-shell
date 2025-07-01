<template>
  <div
    v-if="$isMobile.value"
    class="app-bar-mobile-actions"
  >
    <div
      v-for="button in getButtons"
      :key="button.id"
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
    </div>

    <Transition name="overlay">
      <AppBarOverlay
        v-if="isAnyActionVisible && currentAction?.component"
        :is-sidebar-mode="isSidebarMode"
        :expanded="expanded"
      >
        <component
          :is="currentAction?.component"
          v-bind="currentAction?.props || {}"
          v-on-click-outside="[handleClose, { ignore: ['.app-bar-mobile-actions__button'] }]"
          @close="handleClose"
        />
      </AppBarOverlay>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { VcButton } from "../../../../../.././components";
import { useAppBarMobileButtons } from "../../../../../../../core/composables/useAppBarMobileButtons";
import AppBarOverlay from "./AppBarOverlay.vue";
import { useAppBarMobileActions } from "./../composables/useAppBarMobileActions";
import { MaybeRef, ref, watch } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { AppBarButtonContent } from "../../../../../../../core/services";
import { useRoute } from "vue-router";
export interface Props {
  isSidebarMode: boolean;
  expanded: MaybeRef<boolean>;
}

defineProps<Props>();

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

const handleClose = (button: AppBarButtonContent) => {
  button.onClose?.();
  hideAllActions();
};

watch(route, () => {
  hideAllActions();
});
</script>

<style lang="scss">
.app-bar-mobile-actions {
  @apply tw-relative tw-flex tw-flex-row tw-gap-[30px];

  &__button {
    @apply tw-cursor-pointer tw-text-[var(--app-bar-header-actions-button-color)] #{!important};

    &--active {
      @apply tw-text-[var(--app-bar-header-actions-button-active-color)] #{!important};
    }
  }
}
</style>
