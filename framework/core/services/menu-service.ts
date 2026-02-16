import { Component, ref, type Ref } from "vue";
import * as _ from "lodash-es";
import type { MenuItem, MenuItemBadgeConfig } from "../types";
import { createUnrefFn, useArrayFind } from "@vueuse/core";
import { createPreregistrationBus } from "./_internal";

function menuItemKey(item: MenuItem): string {
  if (item.id !== undefined) return `id:${String(item.id)}`;
  if (item.routeId) return `route:${item.routeId}`;
  if (item.url) return `url:${item.url}`;
  if (item.groupConfig?.id && item.title) return `gc:${item.groupConfig.id}:${item.title}`;
  if (item.group && item.title) return `g:${item.group}:${item.title}`;
  return `hash:${JSON.stringify(_.omit(item, "title"))}`;
}

// Global state for pre-registering badges before the service is available.
const preregisteredMenuBadges: Ref<Map<string, MenuItemBadgeConfig>> = ref(new Map());

export const menuServiceBus = createPreregistrationBus<MenuItem, MenuService>({
  name: "menu-service",
  getKey: menuItemKey,
  registerIntoService: (service, item) => service.addMenuItem(item),
});

/**
 * Registers a menu item before the service is initialized
 */
export function addMenuItem(item: MenuItem): void {
  menuServiceBus.preregister(item);
}

/**
 * Sets a badge for a menu item by its routeId (blade name) or groupId.
 * Can be called at any time, even after menu registration.
 * @param id - routeId for menu items, groupId for groups
 * @param badge - Badge configuration (number, ref, function, or full config)
 */
export function setMenuBadge(id: string, badge: MenuItemBadgeConfig): void {
  preregisteredMenuBadges.value.set(id, badge);
  menuServiceBus.broadcast((service) => {
    service.menuBadges.value.set(id, badge);
  });
}

/**
 * Gets the badge for a menu item by routeId or groupId.
 * @param id - routeId for menu items, groupId for groups
 */
export function getMenuBadge(id: string): MenuItemBadgeConfig | undefined {
  const service = menuServiceBus.getFirstInstance();
  if (service) {
    return service.menuBadges.value.get(id);
  }

  return preregisteredMenuBadges.value.get(id);
}

/**
 * Removes a badge from a menu item.
 * @param id - routeId for menu items, groupId for groups
 */
export function removeMenuBadge(id: string): void {
  preregisteredMenuBadges.value.delete(id);
  menuServiceBus.broadcast((service) => {
    service.menuBadges.value.delete(id);
  });
}

/**
 * Returns the reactive badge registry map.
 * Used internally by menu components to reactively watch for badge changes.
 */
export function getMenuBadges(): Ref<Map<string, MenuItemBadgeConfig>> {
  const service = menuServiceBus.getFirstInstance();
  return service?.menuBadges ?? preregisteredMenuBadges;
}

export interface MenuService {
  addMenuItem: (item: MenuItem) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
  menuBadges: Ref<Map<string, MenuItemBadgeConfig>>;
}

// Default priority values
const DEFAULT_PRIORITY = Infinity;
const DEFAULT_GROUP_PRIORITY = Infinity;

function isSameMenuItem(left: MenuItem, right: MenuItem): boolean {
  if (left.id !== undefined && right.id !== undefined) {
    return String(left.id) === String(right.id);
  }

  if (left.routeId && right.routeId) {
    return left.routeId === right.routeId;
  }

  if (left.url && right.url) {
    return left.url === right.url;
  }

  if (left.groupConfig?.id && right.groupConfig?.id) {
    return left.groupConfig.id === right.groupConfig.id && left.title === right.title;
  }

  if (left.group && right.group) {
    return left.group === right.group && left.title === right.title;
  }

  return _.isEqual(_.omit(left, "title"), _.omit(right, "title"));
}

/**
 * Menu service implementation
 * Handles the registration and organization of menu items
 */
export function createMenuService(): MenuService {
  const menuItems: Ref<MenuItem[]> = ref([]);
  const rawMenu: Ref<MenuItem[]> = ref([]);
  const menuBadges: Ref<Map<string, MenuItemBadgeConfig>> = ref(new Map(preregisteredMenuBadges.value));

  /**
   * Add a new menu item to the raw menu and rebuild the menu structure
   * @param item - The menu item to add
   */
  function addMenuItem(item: MenuItem): void {
    rawMenu.value.push(item);
    constructMenu();
  }

  /**
   * Removes a menu item from the menu
   * @param item - The menu item to remove
   */
  function removeMenuItem(item: MenuItem): void {
    const initialLength = rawMenu.value.length;
    rawMenu.value = rawMenu.value.filter((existingItem) => !isSameMenuItem(existingItem, item));

    if (rawMenu.value.length !== initialLength) {
      constructMenu();
    }
  }

  /**
   * Updates an element in an array or adds it if not found
   */
  const upsert = createUnrefFn(
    (array: (MenuItem | Omit<MenuItem, "icon">)[], element: MenuItem | Omit<MenuItem, "icon">) => {
      const index = array.findIndex((_element) => _.isEqual(_.omit(_element, "title"), _.omit(element, "title")));
      if (index > -1) {
        array[index] = { ...element };
      } else {
        array.push({ ...element });
      }
    },
  );

  /**
   * Sorts menu items by their priority
   */
  function sortByPriority(a: MenuItem, b: MenuItem): number {
    const getPriority = (item: MenuItem): number => item.priority ?? DEFAULT_PRIORITY;
    return getPriority(a) - getPriority(b);
  }

  /**
   * Sorts items within a group by their inGroupPriority / priority
   */
  function sortByGroupPriority(a: MenuItem, b: MenuItem): number {
    const getGroupPriority = (item: MenuItem): number =>
      item.inGroupPriority ?? item.priority ?? DEFAULT_GROUP_PRIORITY;
    return getGroupPriority(a) - getGroupPriority(b);
  }

  /**
   * Creates a localized ID from a title
   */
  function createItemId(title: string): string {
    return _.snakeCase(title);
  }

  /**
   * Processes a menu item that belongs to a group
   */
  function processGroupItem(item: MenuItem, constructedMenu: Ref<MenuItem[]>): void {
    // Skip if no group information provided
    if (!item.group && !item.groupConfig) return;

    let groupId: string;
    let groupTitle: string;
    let groupIcon: string | Component | undefined;
    let groupPriority: number | undefined;
    let groupPermissions: string | string[] | undefined;

    // Prefer groupConfig over legacy group properties
    if (item.groupConfig) {
      // Use the explicit group ID from groupConfig
      groupId = item.groupConfig.id;
      groupTitle = item.groupConfig.title || groupId;
      groupIcon = item.groupConfig.icon;
      groupPriority = item.groupConfig.priority;
      groupPermissions = item.groupConfig.permissions;
    } else {
      // Fallback to legacy group properties
      groupId = "group_" + createItemId(item.group as string);
      groupTitle = item.group as string;
      groupIcon = item.groupIcon;
      groupPriority = item.priority; // Use item priority as group priority for legacy
    }

    const existingGroup = useArrayFind(constructedMenu, (m) => m.groupId === groupId);

    // Create the item to be added to the group
    const groupItem = {
      ..._.omit(item, ["group", "groupIcon", "groupPriority", "groupConfig"]),
      title: item.title,
    } as MenuItem;

    if (existingGroup.value && existingGroup.value.children) {
      // Add to existing group
      upsert(existingGroup.value.children, groupItem);

      // Update existing group properties if using groupConfig
      if (item.groupConfig) {
        if (item.groupConfig.title) {
          existingGroup.value.title = item.groupConfig.title;
        }
        if (item.groupConfig.icon !== undefined) {
          existingGroup.value.groupIcon = item.groupConfig.icon;
        }
        if (item.groupConfig.priority !== undefined) {
          existingGroup.value.priority = item.groupConfig.priority;
        }
        if (item.groupConfig.permissions !== undefined) {
          existingGroup.value.permissions = item.groupConfig.permissions;
        }
      }
    } else {
      // Create a new group with this item
      const group = {
        groupId,
        groupIcon: groupIcon ?? "",
        title: groupTitle,
        children: [groupItem],
        priority: groupPriority ?? item.priority ?? DEFAULT_PRIORITY,
        permissions: groupPermissions,
      } as MenuItem;
      upsert(constructedMenu.value, group);
    }
  }

  /**
   * Processes a standalone menu item (not in a group)
   */
  function processStandaloneItem(item: MenuItem, constructedMenu: Ref<MenuItem[]>): void {
    if (item.title) {
      const standaloneItem = {
        ...item,
        title: item.title,
      } as MenuItem;
      upsert(constructedMenu.value, standaloneItem);
    }
  }

  /**
   * Finalizes menu items by adding IDs and sorting children
   */
  function finalizeMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .map(
        (item): MenuItem => ({
          ...item,
          title: item.title,
          id: item.id || createItemId(item.title),
          children: item.children?.sort(sortByGroupPriority),
        }),
      )
      .sort(sortByPriority);
  }

  /**
   * Constructs the complete menu structure from raw menu items
   */
  function constructMenu(): void {
    const constructedMenu: Ref<MenuItem[]> = ref([]);

    // Process each raw menu item
    rawMenu.value.forEach((item) => {
      if (item.group || item.groupConfig) {
        processGroupItem(item, constructedMenu);
      } else {
        processStandaloneItem(item, constructedMenu);
      }
    });

    // Finalize and set the menu items
    menuItems.value = finalizeMenuItems(constructedMenu.value);
  }

  const service: MenuService = {
    addMenuItem,
    menuItems,
    removeMenuItem,
    menuBadges,
  };

  menuServiceBus.replayInto(service);

  return service;
}
