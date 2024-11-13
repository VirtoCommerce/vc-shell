<template>
  <div>
    <SettingsMenuItem
      icon="fas fa-palette"
      :title="$t('COMPONENTS.THEME_SELECTOR.THEME_SELECTOR')"
      @click="opened = !opened"
    />

    <GenericDropdown
      :opened="opened"
      :items="themes"
      :is-item-active="(theme) => theme === current"
      :on-item-click="handleThemeSelect"
    >
      <template #item="{ item: theme, click }">
        <SettingsMenuItem
          class="tw-py-0"
          :title="_.capitalize(theme)"
          :is-active="theme === current"
          @click="click"
        />
      </template>
    </GenericDropdown>
  </div>
</template>

<script lang="ts" setup>
import { GenericDropdown } from "../generic-dropdown";
import { useTheme } from "../../../core/composables/useTheme";
import { ref, watch } from "vue";
import { notification } from "..";
import * as _ from "lodash-es";
import { SettingsMenuItem } from "../menu-item";

const { current, themes, setTheme } = useTheme();
const opened = ref(false);

const handleThemeSelect = (theme: string) => {
  setTheme(theme);
  opened.value = false;
};

watch(
  () => current.value,
  (newVal) => {
    notification(_.capitalize(newVal));
  },
  { deep: true },
);
</script>

<style lang="scss">
:root {
  --theme-selector-bg-color: var(--additional-50);
  --theme-selector-text-color: var(--base-text-color, var(--neutrals-950));
  --theme-selector-border-color: var(--app-bar-divider-color);
  --theme-selector-hover-bg-color: var(--primary-50);
}
</style>
