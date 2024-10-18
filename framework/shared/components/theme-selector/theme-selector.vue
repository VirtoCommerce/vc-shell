<template>
  <AppBarButtonTemplate
    icon="fas fa-palette"
    :title="$t('COMPONENTS.THEME_SELECTOR.THEME_SELECTOR')"
    position="bottom-end"
  >
    <template #dropdown-content="{ opened, toggle }">
      <Sidebar
        :is-expanded="$isMobile.value ? opened : false"
        position="right"
        render="mobile"
        @close="toggle"
      >
        <template #content>
          <div
            v-if="opened"
            class="vc-theme-selector__dropdown"
            :class="{
              'vc-theme-selector__dropdown--mobile': $isMobile.value,
            }"
          >
            <div
              v-for="(theme, i) in themes"
              :key="i"
              class="vc-theme-selector__item"
              :class="{ 'vc-theme-selector__item--active': theme === current }"
              @click="
                () => {
                  setTheme(theme);
                  toggle();
                }
              "
            >
              {{ themeText(theme) }}
            </div>
          </div>
        </template>
      </Sidebar>
    </template>
  </AppBarButtonTemplate>
</template>

<script lang="ts" setup>
import { AppBarButtonTemplate } from "./../app-bar-button";
import { Sidebar } from "./../sidebar";
import { useTheme } from "./../../../core/composables/useTheme";
import { watch, computed } from "vue";
import { notification } from "./../";
import * as _ from "lodash-es";
import { createUnrefFn } from "@vueuse/core";

const { current, themes, setTheme } = useTheme();

watch(
  () => current.value,
  (newVal) => {
    notification(_.capitalize(newVal), { timeout: 10000000 });
  },
  { deep: true },
);

const themeText = computed(() => {
  return createUnrefFn((theme: string) => {
    return _.capitalize(theme);
  });
});
</script>

<style lang="scss">
:root {
  --theme-selector-bg-color: var(--additional-50);
  --theme-selector-text-color: var(--base-text-color, var(--neutrals-950));
  --theme-selector-border-color: var(--app-bar-divider-color);
  --theme-selector-hover-bg-color: var(--primary-50);
}

.vc-theme-selector {
  &__dropdown {
    @apply tw-bg-[color:var(--theme-selector-bg-color)] tw-min-w-20 tw-max-w-max;

    &--mobile {
      @apply tw-min-w-full tw-max-w-full;
    }
  }

  &__item {
    @apply tw-truncate tw-p-3 tw-text-sm tw-text-[color:var(--theme-selector-text-color)]
      tw-border-l tw-border-solid tw-border-l-[var(--theme-selector-border-color)]
      tw-border-b tw-border-b-[var(--theme-selector-border-color)] tw-w-full tw-cursor-pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--theme-selector-hover-bg-color);
    }

    &--active {
      @apply tw-bg-[color:var(--theme-selector-hover-bg-color)];
    }
  }
}
</style>
