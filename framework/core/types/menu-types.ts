import { Component, ComputedRef, Ref } from "vue";

/**
 * Badge configuration for menu items.
 * Used to display counters or indicators on menu items.
 */
export interface MenuItemBadge {
  /**
   * Badge content - can be a static value, ref, computed, or function returning value.
   */
  content?:
    | string
    | number
    | Ref<string | number | undefined>
    | ComputedRef<string | number | undefined>
    | (() => string | number | undefined);
  /**
   * Badge color variant. Defaults to "primary".
   */
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  /**
   * Show as dot indicator only (ignores content value).
   */
  isDot?: boolean;
}

/**
 * Badge configuration type - supports shorthand (number, ref, function) or full config object.
 */
export type MenuItemBadgeConfig =
  | MenuItemBadge
  | number
  | string
  | Ref<number | string | undefined>
  | ComputedRef<number | string | undefined>
  | (() => number | string | undefined);

export interface MenuItemConfig {
  id?: string;
  /**
   * Menu item title.
   */
  title: string;
  /**
   * Menu item icon.
   */
  icon: string | Component;
  /**
   * Menu group icon.
   *
   * @deprecated Use groupConfig.icon instead for better robustness
   */
  groupIcon?: string | Component;
  /**
   * Menu item group. Is used to group menu items with it's provided name.
   *
   * If the path is not specified, the menu item is added to the root of the menu.
   *
   * @deprecated Use groupConfig instead for better robustness
   */
  group?: string;
  /**
   * Group configuration for creating or updating a group when adding this menu item.
   * This allows creating a group and adding an item to it in one step.
   * If a group with the specified ID already exists, it will be updated with the provided properties.
   */
  groupConfig?: {
    id: string;
    title?: string;
    icon?: string | Component | undefined;
    priority?: number;
    permissions?: string | string[];
    /**
     * Badge configuration for the group.
     */
    badge?: MenuItemBadgeConfig;
  };
  /**
   * Position priority.
   */
  priority: number;
  /**
   * Position priority in group
   *
   * @deprecated Use groupConfig.priority instead for better robustness
   */
  inGroupPriority?: number;
  permissions?: string | string[];
  /**
   * Badge configuration for displaying counters or indicators on this menu item.
   */
  badge?: MenuItemBadgeConfig;
}
