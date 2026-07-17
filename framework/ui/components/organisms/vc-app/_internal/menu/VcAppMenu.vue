<template>
  <VcMenu
    v-if="filteredMenuItems.length || showLoadingPlaceholders"
    :expanded="expanded"
    class="vc-app-menu"
    :class="{ 'vc-app-menu--collapsed': !expanded }"
  >
    <template
      v-for="item in filteredMenuItems"
      :key="item.id ?? item.routeId ?? item.url ?? item.title"
    >
      <!-- Group items (have children) -->
      <VcMenuGroup
        v-if="accessibleChildren(item).length"
        :data-test-id="item.routeId"
        :group-id="getGroupId(item)"
        :icon="item.groupIcon || item.icon"
        :title="$t(item.title)"
        :badge="resolvedBadges.get(item.routeId ?? item.groupId ?? '')"
      >
        <template
          v-for="child in accessibleChildren(item)"
          :key="child.routeId || child.url || child.id || child.title"
        >
          <VcMenuItem
            :data-test-id="child.routeId"
            :icon="child.icon"
            :title="$t(child.title)"
            :badge="resolvedBadges.get(child.routeId ?? child.groupId ?? '')"
            :active="isItemActive(child.url)"
            nested
            @click="handleItemClick(child)"
          />
        </template>
      </VcMenuGroup>

      <!-- Standalone items -->
      <VcMenuItem
        v-else
        :data-test-id="item.routeId"
        :icon="item.groupIcon || item.icon"
        :title="$t(item.title)"
        :badge="resolvedBadges.get(item.routeId ?? item.groupId ?? '')"
        :active="isItemActive(item.url)"
        @click="handleItemClick(item)"
      />
    </template>

    <!-- Placeholders for remote modules still loading. Positions/titles are not
         known until each module installs, so these are generic rows appended at
         the end. v-if (not v-show) so they are fully removed from the DOM once
         modulesReady flips — no lingering hidden nodes. -->
    <template v-if="showLoadingPlaceholders">
      <div
        v-for="n in placeholderCount"
        :key="`vc-app-menu-skeleton-${n}`"
        class="vc-app-menu__skeleton-item"
        aria-hidden="true"
      >
        <VcSkeleton
          variant="circle"
          :width="20"
          :height="20"
        />
        <VcSkeleton
          v-if="expanded"
          variant="block"
          :width="skeletonWidth(n)"
          :height="14"
        />
      </div>
    </template>
  </VcMenu>
</template>

<script lang="ts" setup>
import { computed, inject, isRef, ref, unref, type Ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useMenuService, usePermissions } from "@core/composables";
import type { MenuItem, MenuItemBadgeConfig, MenuItemBadge } from "@core/types";
import { ModulesReadyKey } from "@framework/injection-keys";
import { VcMenu, VcMenuItem, VcMenuGroup } from "@ui/components/molecules/vc-menu";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import type { VcMenuItemBadge } from "@ui/components/molecules/vc-menu";
import { stripTenantPrefix } from "@ui/components/organisms/vc-app/_internal/menu/composables/useMenuActiveState";

export interface Props {
  expanded?: boolean;
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
});

const emit = defineEmits<{
  (event: "item:click", item: MenuItem): void;
}>();

const route = useRoute();
const { t } = useI18n();
const { menuItems, menuBadges } = useMenuService();
const { hasAccess } = usePermissions();

// Remote modules register their menu items on install, which can lag the shell
// mount (manifest fetch + remote load). While they load, show a few placeholder
// rows so the menu does not render a gap. Count is fixed — the number of modules
// that will add a menu item is not known until each installs. `modulesReady` is
// provided by the MF host (@vc-shell/mf-host); defaults to ready when no host is present.
const modulesReady = inject(ModulesReadyKey, ref(true));
const placeholderCount = 3;
const skeletonWidths = [92, 70, 104];
const skeletonWidth = (n: number): number => skeletonWidths[(n - 1) % skeletonWidths.length];
const showLoadingPlaceholders = computed(() => !modulesReady.value && !props.searchQuery?.trim());

const hasAccessToItem = (item: MenuItem): boolean => hasAccess(item.permissions);

const accessibleChildren = (item: MenuItem): MenuItem[] => {
  return (item.children ?? []).filter((child) => hasAccessToItem(child));
};

const visibleMenuItems = computed(() => {
  return menuItems.value.filter((item) => {
    if (!hasAccessToItem(item)) return false;
    if (item.children?.length) return accessibleChildren(item).length > 0;
    return true;
  });
});

const filteredMenuItems = computed(() => {
  const query = props.searchQuery?.toLowerCase().trim();
  if (!query) return visibleMenuItems.value;

  return visibleMenuItems.value
    .map((item) => {
      const children = accessibleChildren(item);

      // Standalone item — match title
      if (!children.length) {
        return t(item.title).toLowerCase().includes(query) ? item : null;
      }

      // Group title matches — show all children
      if (t(item.title).toLowerCase().includes(query)) return item;

      // Filter matching children only
      const matchedChildren = children.filter((child) => t(child.title).toLowerCase().includes(query));

      if (matchedChildren.length) {
        return { ...item, children: matchedChildren };
      }

      return null;
    })
    .filter(Boolean) as MenuItem[];
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

/**
 * Resolve a raw MenuItemBadgeConfig (which may contain Ref, ComputedRef, or function)
 * into a simple VcMenuItemBadge with plain values.
 */
function resolveRawBadge(config: MenuItemBadgeConfig): VcMenuItemBadge | undefined {
  let badge: MenuItemBadge;
  if (typeof config === "object" && !isRef(config) && "content" in config) {
    badge = config as MenuItemBadge;
  } else {
    badge = { content: config as MenuItemBadge["content"] };
  }

  let rawContent: string | number | undefined;
  if (typeof badge.content === "function") {
    rawContent = badge.content();
  } else if (isRef(badge.content)) {
    rawContent = unref(badge.content as Ref<string | number | undefined>);
  } else {
    rawContent = badge.content;
  }

  // Truncate > 99
  let content: string | number | undefined = rawContent;
  if (typeof rawContent === "number" && rawContent > 99) {
    content = "99+";
  } else if (typeof rawContent === "string") {
    const num = parseInt(rawContent, 10);
    if (!isNaN(num) && num > 99) content = "99+";
  }

  const isDot = badge.isDot ?? false;
  const isVisible = isDot || (content != null && content !== "" && content !== 0);
  if (!isVisible) return undefined;

  return {
    content,
    variant: badge.variant ?? "primary",
    isDot,
  };
}

/**
 * Reactive map of all resolved badges keyed by routeId/groupId.
 * Reads from both item.badge config and the menuBadges registry.
 * Recomputes when menuItems or menuBadges change.
 */
const resolvedBadges = computed(() => {
  const result = new Map<string, VcMenuItemBadge>();

  const resolveForItem = (item: MenuItem) => {
    const id = item.routeId ?? item.groupId;
    if (!id) return;

    // Priority: direct badge config > registry by routeId > registry by groupId
    let config: MenuItemBadgeConfig | undefined = item.badge;
    if (!config && item.routeId) config = menuBadges.value.get(item.routeId);
    if (!config && item.groupId) config = menuBadges.value.get(item.groupId);
    if (!config) return;

    const resolved = resolveRawBadge(config);
    if (resolved) result.set(id, resolved);
  };

  for (const item of menuItems.value) {
    resolveForItem(item);
    if (item.children) {
      for (const child of item.children) {
        resolveForItem(child);
      }
    }
  }

  return result;
});
</script>

<style lang="scss">
.vc-app-menu {
  @apply tw-pl-3;
  transition: padding var(--app-bar-transition-duration, 200ms) var(--app-bar-hover-transition-timing-function, ease);

  &--collapsed {
    @apply tw-pl-1 tw-pr-1;
  }

  &__skeleton-item {
    @apply tw-flex tw-items-center tw-gap-1.5 tw-h-9 tw-px-1.5;
  }

  &--collapsed &__skeleton-item {
    @apply tw-justify-center tw-px-0;
  }
}
</style>
