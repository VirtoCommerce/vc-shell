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
        v-if="menuItems && isOpened"
        class="vc-user-sidebar__menu"
        @click.stop="$emit('update:isOpened', false)"
      >
        <!-- Render components separately -->
        <template
          v-for="(item, i) in renderContentItems"
          :key="`render_${i}`"
        >
          <component :is="item.component" />
        </template>

        <!-- Regular menu items -->
        <template
          v-for="(item, i) in regularMenuItems"
          :key="`menu_${i}`"
        >
          <SettingsMenuItem
            :icon="item.icon"
            :title="$t(item.title as string)"
            @click="$emit('item:click', item)"
          />
        </template>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Sidebar } from "../../sidebar";
import { IMenuItem } from "../../../../core/types";
import { SettingsMenuItem } from "../../menu-item";

const props = defineProps<{
  isOpened: boolean;
  menuItems: IMenuItem[];
}>();

defineEmits<{
  (e: "update:isOpened", value: boolean): void;
  (e: "item:click", item: IMenuItem): void;
}>();

// Separate menu items into components and regular items
const renderContentItems = computed(() => props.menuItems.filter((item) => item.component));

const regularMenuItems = computed(() => props.menuItems.filter((item) => !item.component));
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
