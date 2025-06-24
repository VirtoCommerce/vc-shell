<template>
  <Sidebar
    :is-expanded="isOpened"
    position="left"
    render="always"
    :title="$t('SHELL.ACCOUNT.SETTINGS')"
    @close="$emit('update:isOpened', false)"
  >
    <template #content>
      <div
        v-if="isOpened"
        class="vc-user-sidebar__menu"
        @click.stop="$emit('update:isOpened', false)"
      >
        <SettingsMenu />
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { Sidebar } from "../../sidebar";
import { IMenuItem } from "../../../../core/types";
import { SettingsMenu } from "../../settings-menu";

defineProps<{
  isOpened: boolean;
}>();

defineEmits<{
  (e: "update:isOpened", value: boolean): void;
  (e: "item:click", item: IMenuItem): void;
}>();
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
