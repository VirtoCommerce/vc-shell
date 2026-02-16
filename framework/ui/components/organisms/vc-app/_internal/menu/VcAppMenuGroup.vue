<template>
  <div class="vc-app-menu-group">
    <!-- Group header -->
    <VcAppMenuItem
      :icon="icon"
      :title="title"
      :expanded="expanded"
      :badge="badge"
      :route-id="routeId"
      :group-id="groupId"
      @click="toggle"
    >
      <template #suffix>
        <div
          v-if="expanded"
          class="vc-app-menu-group__chevron"
        >
          <VcIcon
            :icon="isOpen ? 'lucide-chevron-up' : 'lucide-chevron-down'"
            size="m"
          />
        </div>
      </template>
    </VcAppMenuItem>

    <!-- Children -->
    <div
      v-show="isOpen"
      class="vc-app-menu-group__children"
      :class="{ 'vc-app-menu-group__children--collapsed': !expanded }"
    >
      <template
        v-for="child in visibleChildren"
        :key="child.routeId || child.url || child.id || child.title"
      >
        <VcTooltip>
          <template
            v-if="!expanded"
            #tooltip
          >
            {{ $t(child.title) }}
          </template>

          <router-link
            v-if="child.url"
            :to="child.url"
            custom
          >
            <VcAppMenuItem
              :data-test-id="child.routeId"
              :icon="child.icon"
              :title="child.title"
              :expanded="expanded"
              :badge="child.badge"
              :route-id="child.routeId"
              :group-id="child.groupId"
              :is-active="isChildActive(child.url)"
              nested
              @click="$emit('item:click', child)"
            />
          </router-link>

          <VcAppMenuItem
            v-else
            :data-test-id="child.routeId"
            :icon="child.icon"
            :title="child.title"
            :expanded="expanded"
            :badge="child.badge"
            :route-id="child.routeId"
            :group-id="child.groupId"
            :is-active="isChildActive(child.url)"
            nested
            @click="$emit('item:click', child)"
          />
        </VcTooltip>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from "vue";
import type { Component } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useRoute } from "vue-router";
import { usePermissions } from "../../../../../../core/composables";
import type { MenuItem, MenuItemBadgeConfig } from "../../../../../../core/types";
import { VcIcon } from "../../../../";
import VcAppMenuItem from "./VcAppMenuItem.vue";
import { stripTenantPrefix } from "./composables/useMenuActiveState";

export interface Props {
  groupId: string;
  icon?: string | Component;
  title?: string;
  children?: MenuItem[];
  expanded?: boolean;
  badge?: MenuItemBadgeConfig;
  routeId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  children: () => [],
});

defineEmits<{
  (event: "item:click", item: MenuItem): void;
}>();

const route = useRoute();
const { hasAccess } = usePermissions();

const storageKey = (() => {
  if (typeof window === "undefined") {
    return `vc_menu_${props.groupId}_open`;
  }

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const appName = pathSegments[0] || "default";
  return `vc_menu_${appName}_${props.groupId}_open`;
})();

// Expand/collapse persisted to localStorage
const isOpen = useLocalStorage(storageKey, false);

const visibleChildren = computed(() => {
  return (props.children ?? []).filter((child) => hasAccess(child.permissions));
});

const isChildActive = (url?: string): boolean => {
  if (!url) return false;
  const path = stripTenantPrefix(route);
  return path === url || path.startsWith(url + "/");
};

// Auto-open if an accessible child route is active
watchEffect(() => {
  if (visibleChildren.value.some((child) => child.url && isChildActive(child.url))) {
    isOpen.value = true;
  }
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="scss">
.vc-app-menu-group {
  &__chevron {
    @apply tw-ml-3 tw-text-[color:var(--app-menu-item-icon-color)];
  }

  &__children {
    @apply tw-gap-1 tw-mt-1 tw-flex tw-flex-col;
  }
}
</style>
