<template>
  <AppBarButtonTemplate
    icon="fas fa-palette"
    :title="themeText(current)"
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
import { useI18n } from "vue-i18n";
import { createUnrefFn } from "@vueuse/core";

const { current, themes, setTheme } = useTheme();
const { t } = useI18n({ useScope: "global" });

watch(
  () => current,
  (newVal) => {
    notification(themeText.value(newVal));
  },
  { deep: true },
);

const themeText = computed(() => {
  return createUnrefFn((theme: string) => {
    return _.capitalize(theme) + t("COMPONENTS.THEME_SELECTOR.THEME_CHANGED");
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
    @apply tw-bg-[color:var(--theme-selector-bg-color)] tw-w-full;
  }

  &__item {
    @apply tw-p-3 tw-text-sm tw-text-[color:var(--theme-selector-text-color)]
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
