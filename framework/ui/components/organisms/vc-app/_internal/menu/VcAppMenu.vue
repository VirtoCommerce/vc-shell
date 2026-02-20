<template>
  <div
    v-if="visibleMenuItems.length"
    class="vc-app-menu"
  >
    <VcContainer
      :no-padding="true"
      class="vc-app-menu__container"
    >
      <div class="vc-app-menu__items">
        <template
          v-for="item in visibleMenuItems"
          :key="item.id ?? item.routeId ?? item.url ?? item.title"
        >
          <!-- Group items (have children) -->
          <VcAppMenuGroup
            v-if="item.children?.length"
            :data-test-id="item.routeId"
            :group-id="getGroupId(item)"
            :icon="item.groupIcon || item.icon"
            :title="item.title"
            :children="accessibleChildren(item)"
            :expanded="expanded"
            :badge="item.badge"
            :route-id="item.routeId"
            @item:click="handleItemClick"
          />

          <!-- Standalone items -->
          <template v-else>
            <router-link
              v-if="item.url"
              :to="item.url"
              custom
            >
              <VcAppMenuItem
                :data-test-id="item.routeId"
                :icon="item.groupIcon || item.icon"
                :title="item.title"
                :expanded="expanded"
                :badge="item.badge"
                :route-id="item.routeId"
                :group-id="item.groupId"
                :is-active="isItemActive(item.url)"
                @click="handleItemClick(item)"
              />
            </router-link>

            <VcAppMenuItem
              v-else
              :data-test-id="item.routeId"
              :icon="item.groupIcon || item.icon"
              :title="item.title"
              :expanded="expanded"
              :badge="item.badge"
              :route-id="item.routeId"
              :group-id="item.groupId"
              :is-active="isItemActive(item.url)"
              @click="handleItemClick(item)"
            />
          </template>
        </template>
      </div>
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMenuService, usePermissions } from "@core/composables";
import type { MenuItem } from "@core/types";
import { VcContainer } from "@ui/components";
import VcAppMenuGroup from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenuGroup.vue";
import VcAppMenuItem from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenuItem.vue";
import { stripTenantPrefix } from "@ui/components/organisms/vc-app/_internal/menu/composables/useMenuActiveState";

export interface Props {
  expanded?: boolean;
}

withDefaults(defineProps<Props>(), {
  expanded: true,
});

const emit = defineEmits<{
  (event: "item:click", item: MenuItem): void;
}>();

const route = useRoute();
const { menuItems } = useMenuService();
const { hasAccess } = usePermissions();

const hasAccessToItem = (item: MenuItem): boolean => hasAccess(item.permissions);

const accessibleChildren = (item: MenuItem): MenuItem[] => {
  return (item.children ?? []).filter((child) => hasAccessToItem(child));
};

const visibleMenuItems = computed(() => {
  return menuItems.value.filter((item) => {
    if (!hasAccessToItem(item)) {
      return false;
    }

    if (item.children?.length) {
      return accessibleChildren(item).length > 0;
    }

    return true;
  });
});

const getGroupId = (item: MenuItem): string => {
  return item.groupId ?? String(item.id ?? item.routeId ?? item.title);
};

const handleItemClick = (item: MenuItem) => {
  emit("item:click", item);
};

const isItemActive = (url?: string): boolean => {
  if (!url) return false;
  const path = stripTenantPrefix(route);
  return path === url || path.startsWith(url + "/");
};
</script>

<style lang="scss">
:root {
  --app-menu-background: var(--primary-50);
  --app-menu-background-color: var(--app-bar-background, var(--neutrals-50));
  --app-menu-version-color: var(--neutrals-400);

  --app-menu-close-color: var(--app-menu-burger-color, var(--primary-500));
  --app-menu-burger-color: var(--primary-500);

  --app-backdrop-overlay-bg: var(--additional-50);
  --app-backdrop-overlay: rgb(from var(--app-backdrop-overlay-bg) r g b / 75%);

  --app-backdrop-shadow-color: var(--additional-950);
  --app-backdrop-shadow:
    0 -6px 6px var(--additional-50),
    1px 1px 22px rgb(from var(--notification-dropdown-shadow-color) r g b / 7%);
}

.vc-app-menu {
  @apply tw-h-full;

  &__container {
    @apply tw-grow tw-basis-0;
  }

  &__items {
    @apply tw-gap-1 tw-flex tw-flex-col tw-h-full;
  }
}
</style>
