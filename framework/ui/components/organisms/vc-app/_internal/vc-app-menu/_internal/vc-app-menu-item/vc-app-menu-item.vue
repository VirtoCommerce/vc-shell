<template>
  <div>
    <template v-if="url">
      <router-link
        :to="url"
        custom
      >
        <vc-app-menu-link
          v-if="isVisible"
          :id="id"
          :sticky="sticky"
          :icon="icon ?? ''"
          :title="title ?? ''"
          :url="url"
          :expand="expand"
          :badge="badge"
          :route-id="routeId"
          :group-id="groupId"
          @on-click="$emit('click')"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        v-if="isVisible"
        :id="id"
        :children="children"
        :sticky="sticky"
        :icon="icon ?? ''"
        :title="title ?? ''"
        :expand="expand"
        :badge="badge"
        :route-id="routeId"
        :group-id="groupId"
        @on-click="$emit('click', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import { MenuItem, MenuItemBadgeConfig } from "../../../../../../../../core/types";
import type { Component } from "vue";
export interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  url?: string;
  icon?: string | Component;
  title?: string;
  children?: MenuItem[];
  expand?: boolean;
  id?: string | number;
  badge?: MenuItemBadgeConfig;
  routeId?: string;
  groupId?: string;
}

export interface Emits {
  (event: "click", item?: MenuItem): void;
}

withDefaults(defineProps<Props>(), {
  sticky: true,
  component: undefined,
  children: () => [],
});

defineEmits<Emits>();
</script>
