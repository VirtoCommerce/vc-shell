import { Component, ref, type Ref } from "vue";
import * as _ from "lodash-es";
import type { MenuItem, MenuItemBadgeConfig } from "@core/types";
import { createPreregistrationBus } from "@core/services/_internal";

/**
 * Canonical identity key for a menu item. Single source of truth.
 * Priority: id → routeId → url → groupConfig.id+title → group+title → deep hash.
 * isSameMenuItem is derived from this function.
 */
function menuItemIdentity(item: MenuItem): string {
  if (item.id !== undefined) return `id:${String(item.id)}`;
  if (item.routeId) return `route:${item.routeId}`;
  if (item.url) return `url:${item.url}`;
  if (item.groupConfig?.id) return `gc:${item.groupConfig.id}:${item.title}`;
  if (item.group) return `g:${item.group}:${item.title}`;
  return `hash:${JSON.stringify(_.omit(item, "title"))}`;
}

// Global state for pre-registering badges before the service is available.
const preregisteredMenuBadges: Ref<Map<string, MenuItemBadgeConfig>> = ref(new Map());

export const menuServiceBus = createPreregistrationBus<MenuItem, MenuService>({
  name: "menu-service",
  getKey: menuItemIdentity,
  registerIntoService: (service, item) => service.addMenuItem(item),
});

/**
 * Registers a menu item before the service is initialized
 */
export function addMenuItem(item: MenuItem): void {
  menuServiceBus.preregister(item);
}

/**
 * Removes a previously registered menu item from the bus store and all live services.
 * Works both before and after the service is initialized.
 *
 * The caller must provide the same identity fields used during registration
 * (typically routeId, or url, or explicit id).
 */
export function removeRegisteredMenuItem(item: MenuItem): void {
  menuServiceBus.removePreregistered((stored) => isSameMenuItem(stored, item));
  menuServiceBus.broadcast((service) => service.removeMenuItem(item));
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

/**
 * Checks if two menu items represent the same logical item.
 * Derived from menuItemIdentity — single source of truth.
 *
 * Note: This is symmetric — both items are compared by their
 * highest-priority identity field. Passing a partial item (e.g. only url)
 * will only match items whose highest-priority field is also url.
 */
function isSameMenuItem(left: MenuItem, right: MenuItem): boolean {
  return menuItemIdentity(left) === menuItemIdentity(right);
}

interface GroupInfo {
  groupId: string;
  groupTitle: string;
  groupIcon: string | Component | undefined;
  groupPriority: number | undefined;
  groupPermissions: string | string[] | undefined;
}

function extractGroupInfo(item: MenuItem): GroupInfo {
  if (item.groupConfig) {
    return {
      groupId: item.groupConfig.id,
      groupTitle: item.groupConfig.title || item.groupConfig.id,
      groupIcon: item.groupConfig.icon,
      groupPriority: item.groupConfig.priority,
      groupPermissions: item.groupConfig.permissions,
    };
  }
  return {
    groupId: "group_" + _.snakeCase(item.group as string),
    groupTitle: item.group as string,
    groupIcon: item.groupIcon,
    groupPriority: item.priority,
    groupPermissions: undefined,
  };
}

function sortByPriority(a: MenuItem, b: MenuItem): number {
  return (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY);
}

function sortByGroupPriority(a: MenuItem, b: MenuItem): number {
  const p = (item: MenuItem): number => item.inGroupPriority ?? item.priority ?? DEFAULT_GROUP_PRIORITY;
  return p(a) - p(b);
}

/**
 * Adds a raw item into the groups map. Creates or updates the group immutably.
 */
function addItemToGroup(item: MenuItem, groups: Map<string, MenuItem>): void {
  const info = extractGroupInfo(item);

  const groupItem = {
    ..._.omit(item, ["group", "groupIcon", "groupPriority", "groupConfig"]),
    title: item.title,
  } as MenuItem;

  const existing = groups.get(info.groupId);

  if (existing) {
    const children = [...(existing.children ?? [])];
    const childIndex = children.findIndex((c) => isSameMenuItem(c, groupItem));
    if (childIndex > -1) {
      children[childIndex] = groupItem;
    } else {
      children.push(groupItem);
    }

    // Immutable group update
    groups.set(info.groupId, {
      ...existing,
      children,
      ...(item.groupConfig?.title && { title: item.groupConfig.title }),
      ...(item.groupConfig?.icon !== undefined && { groupIcon: item.groupConfig.icon }),
      ...(item.groupConfig?.priority !== undefined && { priority: item.groupConfig.priority }),
      ...(item.groupConfig?.permissions !== undefined && { permissions: item.groupConfig.permissions }),
    });
  } else {
    groups.set(info.groupId, {
      groupId: info.groupId,
      groupIcon: info.groupIcon ?? "",
      title: info.groupTitle,
      children: [groupItem],
      priority: info.groupPriority ?? item.priority ?? DEFAULT_PRIORITY,
      permissions: info.groupPermissions,
    } as MenuItem);
  }
}

/**
 * Builds the finalized menu tree from raw items. Pure function — no side effects.
 *
 * Internally uses Maps for dedup (groups by groupId, standalone by identity key).
 * When duplicate items exist in the input, last registration wins.
 */
function buildMenuTree(rawItems: MenuItem[]): MenuItem[] {
  const groups = new Map<string, MenuItem>();
  const standalone = new Map<string, MenuItem>();

  for (const item of rawItems) {
    if (item.group || item.groupConfig) {
      addItemToGroup(item, groups);
    } else if (item.title) {
      standalone.set(menuItemIdentity(item), { ...item });
    }
  }

  return finalizeMenuItems([...groups.values(), ...standalone.values()]);
}

function finalizeMenuItems(items: MenuItem[]): MenuItem[] {
  return items
    .map(
      (item): MenuItem => ({
        ...item,
        children: item.children ? [...item.children].sort(sortByGroupPriority) : undefined,
      }),
    )
    .sort(sortByPriority);
}

/**
 * Menu service implementation
 * Handles the registration and organization of menu items
 */
export function createMenuService(): MenuService {
  const menuItems: Ref<MenuItem[]> = ref([]);
  let rawMenu: MenuItem[] = [];
  const menuBadges: Ref<Map<string, MenuItemBadgeConfig>> = ref(new Map(preregisteredMenuBadges.value));

  function addMenuItem(item: MenuItem): void {
    rawMenu.push(item);
    menuItems.value = buildMenuTree(rawMenu);
  }

  function removeMenuItem(item: MenuItem): void {
    const before = rawMenu.length;
    rawMenu = rawMenu.filter((raw) => !isSameMenuItem(raw, item));
    if (rawMenu.length !== before) {
      menuItems.value = buildMenuTree(rawMenu);
    }
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
