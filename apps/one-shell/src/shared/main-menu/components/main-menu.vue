<template>
  <VcMenu
    :loading="loading"
    :expanded="expanded"
    class="main-menu"
    :class="{ 'main-menu--collapsed': !expanded }"
  >
    <VcMenuGroup
      v-for="section in menu"
      :key="section.id"
      :group-id="section.id"
      :title="section.title"
      variant="section"
      :open="true"
    >
      <template
        v-for="item in section.items"
        :key="item.id"
      >
        <VcMenuGroup
          v-if="item.children?.length"
          :group-id="item.id"
          :icon="item.icon"
          :title="item.label"
        >
          <VcMenuItem
            v-for="child in item.children"
            :key="child.id"
            :icon="child.icon"
            :title="child.label"
            :active="child.id === activeItemId"
            nested
            @click="child.url && emit('itemClick', { id: child.id, url: child.url })"
          />
        </VcMenuGroup>

        <VcMenuItem
          v-else
          :icon="item.icon"
          :title="item.label"
          :active="item.id === activeItemId"
          @click="item.url && emit('itemClick', { id: item.id, url: item.url })"
        />
      </template>
    </VcMenuGroup>
  </VcMenu>
</template>

<script setup lang="ts">
import { VcMenu, VcMenuItem, VcMenuGroup } from "@vc-shell/framework";
import type { MenuSection } from "../types";

interface Props {
  menu: MenuSection[];
  loading?: boolean;
  expanded?: boolean;
  activeItemId?: string;
}

withDefaults(defineProps<Props>(), {
  expanded: true,
});

const emit = defineEmits<{
  itemClick: [item: { id: string; url: string }];
}>();
</script>

<style lang="scss" scoped>
.main-menu {
  @apply tw-pl-3;
  transition: padding var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease);

  &--collapsed {
    @apply tw-pl-1 tw-pr-1;
  }
}
</style>
