<template>
  <SettingsMenuItem
    icon="lucide-palette"
    :title="$t('COMPONENTS.THEME_SELECTOR.THEME_SELECTOR')"
    :value="currentLocalizedName"
  >
    <template #submenu>
      <VcDropdownItem
        v-for="theme in themes"
        :key="theme.key"
        :title="theme.name"
        :active="theme.key === currentThemeKey"
        @click="handleThemeSelect(theme)"
      />
    </template>
  </SettingsMenuItem>
</template>

<script lang="ts" setup>
import { useTheme } from "@core/composables/useTheme";
import { notification } from "@shared/components/notifications";
import { SettingsMenuItem } from "@shell/components/settings-menu-item";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

const { currentThemeKey, currentLocalizedName, themes, setTheme } = useTheme();

const handleThemeSelect = (theme: { key: string; name: string }) => {
  setTheme(theme.key);

  if (currentLocalizedName.value) {
    notification(currentLocalizedName.value);
  }
};
</script>
