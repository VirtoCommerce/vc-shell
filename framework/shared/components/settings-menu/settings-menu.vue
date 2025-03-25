<template>
  <div class="vc-settings-menu">
    <component
      :is="item.component"
      v-for="item in items"
      :key="item.id"
      v-bind="item.props || {}"
    />
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { useSettingsMenu } from "../../../core/composables/useSettingsMenu";
import { SettingsMenuServiceKey } from "../../../injection-keys";

const settingsMenu = useSettingsMenu();
const { items } = settingsMenu;
</script>

<style lang="scss">
.vc-settings-menu {
  @apply tw-w-full;
}
</style>
