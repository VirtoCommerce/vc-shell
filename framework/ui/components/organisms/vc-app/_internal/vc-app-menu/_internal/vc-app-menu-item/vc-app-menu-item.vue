<template>
  <div>
    <template v-if="url">
      <router-link
        v-slot="{ isExactActive }"
        :to="url"
        custom
      >
        <vc-app-menu-link
          v-if="isVisible"
          :is-active="isExactActive"
          :sticky="sticky"
          :icon="icon ?? ''"
          :title="title ?? ''"
          :url="url"
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
