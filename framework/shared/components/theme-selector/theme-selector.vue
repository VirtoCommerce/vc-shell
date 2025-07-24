<template>
  <SettingsMenuItem @trigger:click="opened = !opened">
    <template #trigger>
      <div class="vc-theme-selector__trigger">
        <VcIcon
          icon="material-palette"
          class="vc-theme-selector__icon"
        />
        <span class="vc-theme-selector__title">
          {{ $t("COMPONENTS.THEME_SELECTOR.THEME_SELECTOR") }}
        </span>
      </div>
    </template>

    <template #content>
      <GenericDropdown
        :opened="opened"
        :items="themes"
        :is-item-active="(theme) => theme.key === currentThemeKey"
        @item-click="handleThemeSelect"
      >
        <template #item="{ item: theme, click }">
          <div
            class="vc-theme-selector__item"
            :class="{ 'vc-theme-selector__item--active': theme.key === currentThemeKey }"
            @click="click"
          >
            <span class="vc-theme-selector__item-title">{{ theme.name }}</span>
          </div>
        </template>
      </GenericDropdown>
    </template>
  </SettingsMenuItem>
</template>

<script lang="ts" setup>
import { GenericDropdown } from "../generic-dropdown";
import { useTheme } from "../../../core/composables/useTheme";
import { ref } from "vue";
import { notification } from "..";
import { SettingsMenuItem } from "../settings-menu-item";
import { VcIcon } from "../../../ui/components";

const { currentThemeKey, currentLocalizedName, themes, setTheme } = useTheme();
const opened = ref(false);

const handleThemeSelect = (theme: { key: string; name: string }) => {
  setTheme(theme.key);
  opened.value = false;

  if (currentLocalizedName.value) {
    notification(currentLocalizedName.value);
  }
};
</script>

<style lang="scss">
.vc-theme-selector {
  &__trigger {
    @apply tw-flex tw-items-center tw-w-full;
  }

  &__icon {
    @apply tw-w-6 tw-mr-3;
  }

  &__title {
    @apply tw-flex-grow;
  }

  &__item {
    @apply tw-flex tw-items-center tw-w-full tw-px-6 tw-py-3
      tw-cursor-pointer tw-transition-colors
      hover:tw-bg-[color:var(--menu-item-bg-hover)];

    &--active {
      @apply tw-bg-[color:var(--menu-item-bg-active)];
    }
  }

  &__item-title {
    @apply tw-flex-grow;
  }
}
</style>
