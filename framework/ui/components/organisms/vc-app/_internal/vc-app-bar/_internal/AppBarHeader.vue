<template>
  <div
    v-if="($isMobile.value && blades.length <= 1) || $isDesktop.value"
    class="app-bar-header"
    :class="{
      'app-bar-header--collapsed': !expanded && !$isMobile.value,
      'app-bar-header--mobile': $isMobile.value,
    }"
  >
    <div class="app-bar-header__logo-container">
      <div class="app-bar-header__logo">
        <img
          class="app-bar-header__logo-image"
          :class="{ 'app-bar-header__logo-image--mobile': $isMobile.value }"
          alt="logo"
          :src="logo"
          @click="$isMobile.value ? $emit('toggle-menu') : $emit('logo:click')"
        />
        <div
          v-if="hasUnread && !expanded"
          class="app-bar-header__menu-button-accent"
        />
      </div>

      <template v-if="$isMobile.value && blades.length === 1">
        <!-- Show blades name when at least one blade is opened -->
        <p class="app-bar-header__blade-title">
          {{ viewTitle }}
        </p>
      </template>
    </div>

    <div
      v-if="$isMobile.value"
      class="app-bar-header__actions"
    >
      <slot
        v-if="$isMobile.value"
        name="actions"
      />
    </div>

    <Transition
      name="burger-fade"
      mode="out-in"
    >
      <button
        v-if="expanded && $isDesktop.value"
        ref="menuButtonRef"
        class="app-bar-header__menu-button"
        @click="$emit('toggle-menu')"
      >
        <div class="app-bar-header__menu-button-wrap">
          <VcIcon
            :icon="MenuBurgerIcon"
            size="xs"
          />
          <div
            v-if="hasUnread"
            class="app-bar-header__menu-button-accent"
          />
        </div>
      </button>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "../../../../../";
import { MenuBurgerIcon } from "../../../../../atoms/vc-icon/icons";
import { computed, ref, watchEffect, MaybeRef } from "vue";
import { useNotifications } from "../../../../../../../core/composables";
import { useBladeNavigation } from "./../../../../../../../shared";

defineProps<{
  logo?: string;
  expanded: MaybeRef<boolean>;
}>();

defineEmits<{
  (e: "logo:click"): void;
  (e: "toggle-menu"): void;
}>();

const { notifications } = useNotifications();
const { blades, currentBladeNavigationData } = useBladeNavigation();

const viewTitle = ref("");
const currentBladeId = ref(0);

watchEffect(
  () => {
    const currentTitle = currentBladeNavigationData.value?.instance?.title;
    const lastBladeTitle = blades.value[blades.value.length - 1]?.props?.navigation?.instance?.title;
    currentBladeId.value = blades.value[blades.value.length - 1]?.props?.navigation?.idx || 0;
    viewTitle.value = currentTitle ?? lastBladeTitle ?? "";
  },
  { flush: "post" },
);

const hasUnread = computed(() => {
  return notifications.value.some((item) => item.isNew);
});
</script>

<style lang="scss">
:root {
  --app-bar-header-padding-top: 18px;
  --app-bar-header-blade-title: var(--neutrals-950);
  --app-bar-accent-color: var(--danger-500);

  --app-bar-header-actions-button-color: var(--neutrals-500);
  --app-bar-header-actions-button-active-color: var(--primary-500);
}

.app-bar-header {
  @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-[var(--app-bar-padding)] tw-h-[var(--app-bar-height)] tw-py-[var(--app-bar-header-padding-top)];

  &--collapsed {
    @apply tw-items-center tw-justify-between tw-border-0 tw-gap-[16px];
  }

  &--mobile {
    @apply tw-h-[var(--app-bar-mobile-height)] tw-px-[var(--app-bar-padding-mobile)];
  }

  &__logo {
    @apply tw-w-auto tw-flex tw-items-center tw-h-full tw-relative;

    &-container {
      @apply tw-flex tw-flex-row tw-gap-3 tw-items-center;
    }

    &-image {
      @apply tw-cursor-pointer tw-max-w-[var(--app-bar-logo-width)] tw-max-h-[var(--app-bar-logo-height)] tw-overflow-hidden tw-w-full tw-shrink-0;

      &--mobile {
        @apply tw-mx-1 tw-max-w-[var(--app-bar-logo-mobile-width)] tw-max-h-[var(--app-bar-logo-mobile-height)] tw-rounded-full;
      }
    }
  }

  &__menu-button {
    @apply tw-cursor-pointer tw-relative;

    &-wrap {
      @apply tw-relative;
    }

    &-accent {
      @apply tw-block tw-absolute tw-right-[-7px] tw-top-[-5px] tw-w-[5px] tw-h-[5px] tw-rounded-full tw-z-[1] tw-bg-[var(--app-bar-accent-color)];
    }
  }

  &__blade-title {
    @apply tw-text-lg tw-font-bold tw-text-[var(--app-bar-header-blade-title)];
  }

  &__actions {
    @apply tw-flex tw-items-center;
  }
}

.burger-fade-enter-active,
.burger-fade-leave-active {
  transition: opacity 0.1s ease;
}

.burger-fade-enter-from,
.burger-fade-leave-to {
  opacity: 0;
}
</style>
