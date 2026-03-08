<template>
  <VcMenu :loading="loading">
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
            nested
            @click="child.url && emit('itemClick', { id: child.id, url: child.url })"
          />
        </VcMenuGroup>

        <VcMenuItem
          v-else
          :icon="item.icon"
          :title="item.label"
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
}

defineProps<Props>();

const emit = defineEmits<{
  itemClick: [item: { id: string; url: string }];
}>();
</script>
