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
import { useSettingsMenu } from "../../../core/composables/useSettingsMenu";

const { items } = useSettingsMenu();
</script>

<style lang="scss">
.vc-settings-menu {
  @apply tw-w-full;
}
</style>
