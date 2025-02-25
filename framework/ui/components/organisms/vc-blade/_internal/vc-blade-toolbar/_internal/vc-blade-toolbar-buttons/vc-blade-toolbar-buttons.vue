<template>
  <div class="vc-blade-toolbar-buttons">
    <VcBladeToolbarMobile
      v-if="$isMobile.value"
      :items="items"
    />
    <VcBladeToolbarDesktop
      v-else
      :items="items"
      :is-expanded="isExpanded"
    />
  </div>
</template>

<script lang="ts" setup>
import { IBladeToolbar } from "../../../../../../../../core/types";
import VcBladeToolbarMobile from "./mobile/vc-blade-toolbar-mobile.vue";
import VcBladeToolbarDesktop from "./desktop/vc-blade-toolbar-desktop.vue";

defineProps<{
  items: IBladeToolbar[];
  isExpanded: boolean;
}>();
</script>

<style lang="scss">
.vc-blade-toolbar-buttons {
  @apply tw-relative tw-overflow-hidden tw-flex;
  width: -webkit-fill-available;
  width: -moz-available !important;
}
</style>
