import { computed, unref, isRef, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import type { MenuItemBadgeConfig, MenuItemBadge } from "@core/types";
import { useMenuService } from "@core/composables/useMenuService";

export interface ResolvedBadge {
  content: string | number | undefined;
  variant: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  isDot: boolean;
  isVisible: boolean;
}

/**
 * Composable to resolve badge configuration for menu items.
 * Supports direct badge config, routeId lookup, or groupId lookup.
 *
 * @param badgeConfig - Direct badge configuration (takes priority). Accepts a reactive getter.
 * @param routeId - Route ID to lookup badge from registry. Accepts a reactive getter.
 * @param groupId - Group ID to lookup badge from registry. Accepts a reactive getter.
 */
export function useBadge(
  badgeConfig: MaybeRefOrGetter<MenuItemBadgeConfig | undefined>,
  routeId?: MaybeRefOrGetter<string | undefined>,
  groupId?: MaybeRefOrGetter<string | undefined>,
): ComputedRef<ResolvedBadge> {
  const { menuBadges } = useMenuService();

  return computed(() => {
    // Priority: direct badge config > badge from registry by routeId > badge from registry by groupId
    let config: MenuItemBadgeConfig | undefined = toValue(badgeConfig);
    const resolvedRouteId = toValue(routeId);
    const resolvedGroupId = toValue(groupId);
    if (!config && resolvedRouteId) {
      config = menuBadges.value.get(resolvedRouteId);
    }
    if (!config && resolvedGroupId) {
      config = menuBadges.value.get(resolvedGroupId);
    }

    if (!config) {
      return { content: undefined, variant: "primary", isDot: false, isVisible: false };
    }

    // Normalize shorthand to full config object
    let badge: MenuItemBadge;
    if (typeof config === "object" && !isRef(config) && "content" in config) {
      badge = config as MenuItemBadge;
    } else {
      badge = { content: config as MenuItemBadge["content"] };
    }

    // Resolve reactive content
    let rawContent: string | number | undefined = undefined;
    if (typeof badge.content === "function") {
      rawContent = badge.content();
    } else if (isRef(badge.content)) {
      rawContent = unref(badge.content as Ref<string | number | undefined>);
    } else {
      rawContent = badge.content;
    }

    // Truncate values > 99
    let displayContent: string | number | undefined = rawContent;
    if (typeof rawContent === "number" && rawContent > 99) {
      displayContent = "99+";
    } else if (typeof rawContent === "string") {
      const numValue = parseInt(rawContent, 10);
      if (!isNaN(numValue) && numValue > 99) {
        displayContent = "99+";
      }
    }

    const isDot = badge.isDot ?? false;
    const isVisible = isDot || (displayContent != null && displayContent !== "" && displayContent !== 0);

    return {
      content: displayContent,
      variant: badge.variant ?? "primary",
      isDot,
      isVisible,
    };
  });
}
