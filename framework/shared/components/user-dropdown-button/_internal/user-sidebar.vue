<template>
  <VcSidebar
    :model-value="isOpened"
    position="left"
    :teleport="!isDesktop"
    :title="$t('SHELL.ACCOUNT.SETTINGS')"
    @update:model-value="$emit('update:isOpened', $event)"
  >
    <div
      v-if="isOpened"
      class="vc-user-sidebar__menu"
      @click.stop="$emit('update:isOpened', false)"
    >
      <SettingsMenu />
    </div>
  </VcSidebar>
</template>

<script lang="ts" setup>
import { inject, ref, type Ref } from "vue";
import { IsDesktopKey } from "@framework/injection-keys";
import { IMenuItem } from "@core/types";
import { SettingsMenu } from "@shared/components/settings-menu";
import { VcSidebar } from "@ui/components";

defineProps<{
  isOpened: boolean;
}>();

defineEmits<{
  (e: "update:isOpened", value: boolean): void;
  (e: "item:click", item: IMenuItem): void;
}>();

const isDesktop = inject(IsDesktopKey, ref(false));
</script>

<style lang="scss">
.vc-user-sidebar {
  &__menu {
    @apply tw-w-full tw-flex tw-flex-col;
  }

  .vc-app_mobile & {
    &__menu {
      @apply tw-static tw-shadow-none #{!important};
    }
  }
}
</style>
