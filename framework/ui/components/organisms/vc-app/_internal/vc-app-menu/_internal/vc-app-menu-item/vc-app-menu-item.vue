<template>
  <div>
    <template v-if="url">
      <router-link
        :to="url"
        custom
      >
        <vc-app-menu-link
          v-if="isVisible"
          :sticky="sticky"
          :icon="icon ?? ''"
          :title="title ?? ''"
          :url="url"
          :expand="expand"
          @on-click="$emit('click')"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        v-if="isVisible"
        :children="children"
        :sticky="sticky"
        :icon="icon ?? ''"
        :title="title ?? ''"
        :expand="expand"
        @on-click="$emit('click', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import { MenuItem } from "../../../../../../../../core/types";

export interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  url?: string;
  icon?: string;
  title?: string;
  children?: MenuItem[];
  expand?: boolean;
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
