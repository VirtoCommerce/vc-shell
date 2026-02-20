<template>
  <SettingsMenuItem
    ref="menuItemRef"
    icon="material-palette"
    :title="$t('COMPONENTS.THEME_SELECTOR.THEME_SELECTOR')"
    :value="currentLocalizedName"
    :show-chevron="true"
    :is-active="isSubMenuOpen"
    @trigger:click="isSubMenuOpen = !isSubMenuOpen"
  />

  <VcDropdownPanel
    v-model:show="isSubMenuOpen"
    :anchor-ref="menuItemRef?.triggerRef ?? null"
    placement="right-start"
    width="180px"
    max-width="260px"
  >
    <div class="tw-p-1">
      <VcDropdownItem
        v-for="theme in themes"
        :key="theme.key"
        :title="theme.name"
        :active="theme.key === currentThemeKey"
        @click="handleThemeSelect(theme)"
      />
    </div>
  </VcDropdownPanel>
</template>

<script lang="ts" setup>
import { useTheme } from "@core/composables/useTheme";
import { ref } from "vue";
import { notification } from "..";
import { SettingsMenuItem } from "@shared/components/settings-menu-item";
import { VcDropdownPanel } from "@ui/components";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

const { currentThemeKey, currentLocalizedName, themes, setTheme } = useTheme();
const isSubMenuOpen = ref(false);
const menuItemRef = ref<InstanceType<typeof SettingsMenuItem> | null>(null);

const handleThemeSelect = (theme: { key: string; name: string }) => {
  setTheme(theme.key);
  isSubMenuOpen.value = false;

  if (currentLocalizedName.value) {
    notification(currentLocalizedName.value);
  }
};
</script>
