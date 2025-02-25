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
import { SettingsMenuKey, useSettingsMenu } from "../../composables/useSettingsMenu";

const settingsMenu = inject(SettingsMenuKey, useSettingsMenu());
const { items } = settingsMenu;
</script>

<style lang="scss">
.vc-settings-menu {
  @apply tw-w-full;
}
</style>
