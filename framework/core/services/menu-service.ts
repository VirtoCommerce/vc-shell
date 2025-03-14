import { computed, ComputedRef, ref, type Ref, type Component } from "vue";
import * as _ from "lodash-es";
import { i18n } from "./../plugins/i18n";
import type { MenuItem, MenuItemConfig } from "../types";
import { createUnrefFn, useArrayFind } from "@vueuse/core";
import { usePermissions } from "../composables";

// Global state for pre-registering menu items
const preregisteredMenuItems: Ref<MenuItem[]> = ref([]);

// Separate interface for creating a group where id can be optional
export interface MenuItemConfigCreateOptions extends Omit<MenuItemConfig, "id"> {
  id?: string;
}

/**
 * Configuration for creating a group together with a menu item
 */
export interface MenuItemWithGroupConfig extends Omit<MenuItemConfig, "group" | "groupId" | "groupIcon"> {
  /**
   * Required group configuration for automatically creating a group.
   * The item will be added to this group.
   */
  groupConfig: MenuItemConfigCreateOptions;
}

// Global state for menu groups
const MenuItemConfigs: Ref<Record<string, MenuItemConfig>> = ref({});

/**
 * Helper function to create a menu item with group in one step
 * @param item - The menu item properties
 * @param group - The group properties
 * @param inGroupPriority - Optional priority within the group, defaults to item.priority
 * @returns A menu item configuration with embedded group
 */
export function createMenuItemWithGroup(
  item: Omit<MenuItemConfig, "group" | "groupId">,
  group: MenuItemConfigCreateOptions,
  inGroupPriority?: number,
): MenuItemWithGroupConfig {
  return {
    ...item,
    // Use explicitly passed inGroupPriority or item.priority as a fallback
    inGroupPriority: inGroupPriority ?? item.priority,
    groupConfig: {
      id: group.id || _.uniqueId("group_"),
      ...group,
    },
  };
}

/**
 * Registers a menu item before the service is initialized
 */
export function addMenuItem(item: MenuItem | MenuItemWithGroupConfig): void {
  // We need to convert the type because the external function can accept MenuItemWithGroupConfig,
  // but preregisteredMenuItems expects MenuItem
  if ("groupConfig" in item) {
    // Conversion will be performed in the addMenuItem function inside createMenuService
    preregisteredMenuItems.value.push(item as unknown as MenuItem);
  } else {
    preregisteredMenuItems.value.push(item);
  }
}

export interface MenuService {
  /**
   * Adds a menu item to the menu.
   * If the item contains a `groupConfig` property, the group will be created automatically
   * if it doesn't exist yet.
   * @param item - The menu item to add or a config with both item and group
   */
  addMenuItem: (item: MenuItem | MenuItemWithGroupConfig) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updatedItem: Partial<MenuItem>) => boolean;
  getMenuItem: (id: string) => MenuItem | undefined;
  createMenuItemConfig: (group: MenuItemConfigCreateOptions) => string;
  updateMenuItemConfig: (id: string, group: Partial<MenuItemConfig>) => boolean;
  removeMenuItemConfig: (id: string) => boolean;
  getMenuItemConfigs: () => Record<string, MenuItemConfig>;
}

// Default priority values
const DEFAULT_PRIORITY = Infinity;
const DEFAULT_GROUP_PRIORITY = Infinity;

// State
const menuItems: Ref<MenuItem[]> = ref([]);
const rawMenu: Ref<MenuItem[]> = ref([]);

/**
 * Menu service implementation
 * Handles the registration and organization of menu items
 */
export function createMenuService(): MenuService {
  const { t } = i18n.global;
  const { hasAccess } = usePermissions();

  /**
   * Add a new menu item to the raw menu and rebuild the menu structure
   * @param item - The menu item to add, or a menu item with group configuration
   */
  function addMenuItem(item: MenuItem | MenuItemWithGroupConfig): void {
    // Check if item contains group configuration
    if ("groupConfig" in item && item.groupConfig) {
      // Either use existing group or create a new one
      let groupId: string;
      const groupConfig = item.groupConfig;

      // If the group already exists with the same id, use that
      if (groupConfig.id && MenuItemConfigs.value[groupConfig.id]) {
        groupId = groupConfig.id;
        // Optionally update the group with any new properties
        updateMenuItemConfig(groupId, groupConfig);
      } else {
        // Create a new group
        groupId = createMenuItemConfig(groupConfig);
      }

      // Create the menu item with the group ID
      const menuItem: MenuItem = {
        ..._.omit(item, ["groupConfig"]),
        groupId,
        // Если не указан inGroupPriority, используем priority для совместимости
        inGroupPriority: item.inGroupPriority ?? item.priority,
      } as MenuItem;

      // Add it to the raw menu
      rawMenu.value.push(menuItem);
    } else {
      // Regular menu item, just add it
      rawMenu.value.push(item as MenuItem);
    }

    constructMenu();
  }

  /**
   * Removes a menu item from the menu
   * @param item - The menu item to remove
   */
  function removeMenuItem(item: MenuItem): void {
    const index = rawMenu.value.findIndex(
      (menuItem) => menuItem.id === item.id || (menuItem.title === item.title && menuItem.group === item.group),
    );

    if (index !== -1) {
      rawMenu.value.splice(index, 1);
      constructMenu();
    }
  }

  /**
   * Updates an existing menu item by id
   * @param id - The id of the menu item to update
   * @param updatedItem - The updated properties
   * @returns true if the item was found and updated, false otherwise
   */
  function updateMenuItem(id: string, updatedItem: Partial<MenuItem>): boolean {
    const index = rawMenu.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      rawMenu.value[index] = { ...rawMenu.value[index], ...updatedItem };
      constructMenu();
      return true;
    }
    return false;
  }

  /**
   * Get a menu item by id
   * @param id - The id of the menu item
   * @returns The menu item or undefined if not found
   */
  function getMenuItem(id: string): MenuItem | undefined {
    // First try to find in top level menu items
    const topLevelItem = menuItems.value.find((item) => item.id === id);
    if (topLevelItem) return topLevelItem;

    // Then look in children
    for (const item of menuItems.value) {
      if (item.children) {
        const childItem = item.children.find((child) => child.id === id);
        if (childItem) return childItem;
      }
    }

    return undefined;
  }

  /**
   * Creates a new menu group
   * @param group - The group to create
   * @returns The id of the created group
   */
  function createMenuItemConfig(group: MenuItemConfigCreateOptions): string {
    // Use provided id or generate a new one
    const groupId = group.id || _.uniqueId("group_");

    MenuItemConfigs.value[groupId] = {
      ...group,
      id: groupId,
    } as MenuItemConfig;

    // Rebuild menu to incorporate the new group
    constructMenu();

    return groupId;
  }

  /**
   * Updates an existing menu group
   * @param id - The id of the group to update
   * @param group - The updated properties
   * @returns true if the group was found and updated, false otherwise
   */
  function updateMenuItemConfig(id: string, group: Partial<MenuItemConfig>): boolean {
    if (MenuItemConfigs.value[id]) {
      MenuItemConfigs.value[id] = { ...MenuItemConfigs.value[id], ...group };
      constructMenu();
      return true;
    }
    return false;
  }

  /**
   * Removes a menu group
   * @param id - The id of the group to remove
   * @returns true if the group was found and removed, false otherwise
   */
  function removeMenuItemConfig(id: string): boolean {
    if (MenuItemConfigs.value[id]) {
      delete MenuItemConfigs.value[id];

      // Update menu items that belonged to this group
      rawMenu.value = rawMenu.value.filter((item) => item.groupId !== id);

      constructMenu();
      return true;
    }
    return false;
  }

  /**
   * Gets all menu groups
   * @returns All menu groups
   */
  function getMenuItemConfigs(): Record<string, MenuItemConfig> {
    return { ...MenuItemConfigs.value };
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
   * Sorts items within a group by their inGroupPriority
   */
  function sortByGroupPriority(a: MenuItem, b: MenuItem): number {
    const getGroupPriority = (item: MenuItem): number =>
      item.inGroupPriority ?? item.groupConfig?.priority ?? DEFAULT_GROUP_PRIORITY;
    return getGroupPriority(a) - getGroupPriority(b);
  }

  /**
   * Creates a localized ID from a title
   */
  function createItemId(title: string | ComputedRef<string>): string {
    const titleValue = typeof title === "string" ? t(title) : title.value;
    return _.snakeCase(titleValue);
  }

  /**
   * Creates a localized computed title
   */
  function createLocalizedTitle(title: string): ComputedRef<string> {
    return computed(() => t(title));
  }

  /**
   * Checks if the current user has permission to see the menu item
   * @param item - The menu item to check
   * @returns true if the user has permission, false otherwise
   */
  function hasPermissionForItem(item: MenuItem): boolean {
    // If no permissions are specified, the item is visible to everyone
    if (!item.permissions || (Array.isArray(item.permissions) && item.permissions.length === 0)) {
      return true;
    }

    // Check if user has any of the required permissions
    return hasAccess(item.permissions);
  }

  /**
   * Processes a menu item that belongs to a group
   */
  function processGroupItem(item: MenuItem, constructedMenu: Ref<MenuItem[]>): void {
    // Skip items the user doesn't have permission to see
    if (!hasPermissionForItem(item)) return;

    // Handle both legacy (group by name) and new (group by id) approaches
    let groupId: string;
    let groupTitle: string;
    let groupIcon: string | Component = "";
    let groupPriority: number = DEFAULT_PRIORITY;
    let groupPermissions: string | string[] | undefined;

    // If using groupId (new way)
    if (item.groupId && MenuItemConfigs.value[item.groupId]) {
      const group = MenuItemConfigs.value[item.groupId];
      groupId = "group_" + group.id;
      groupTitle = group.title;
      groupIcon = group.icon || "";
      groupPriority = group.priority || DEFAULT_PRIORITY;
      groupPermissions = group.permissions;
    }
    // If using group string (legacy way)
    else if (item.group) {
      console.warn("Using item.group is deprecated, please use item.groupId instead");
      groupId = "group_" + createItemId(item.group);
      groupTitle = item.group;
      groupIcon = item.groupIcon || "";
      groupPriority = item.priority || DEFAULT_PRIORITY;
      groupPermissions = item.permissions;
    }
    // Skip if no valid group reference found
    else {
      return;
    }

    const existingGroup = useArrayFind(constructedMenu, (m) => m.groupId === groupId);

    // Create the item to be added to the group
    const groupItem = {
      ..._.omit(item, ["group", "groupIcon", "priority", "groupId"]),
      title: createLocalizedTitle(item.title as string),
      // Ensure inGroupPriority is preserved and used
      inGroupPriority: item.inGroupPriority || item.priority || DEFAULT_GROUP_PRIORITY,
    } as MenuItem;

    if (existingGroup.value && existingGroup.value.children) {
      // Add to existing group
      upsert(existingGroup.value.children, groupItem);
    } else {
      // Skip creating group if user doesn't have permission for the group
      if (groupPermissions && !hasAccess(groupPermissions)) {
        return;
      }

      // Create a new group with this item
      const group = {
        groupId,
        groupIcon,
        title: createLocalizedTitle(groupTitle),
        children: [groupItem],
        priority: groupPriority,
        permissions: groupPermissions,
      } as MenuItem;
      upsert(constructedMenu.value, group);
    }
  }

  /**
   * Processes a standalone menu item (not in a group)
   */
  function processStandaloneItem(item: MenuItem, constructedMenu: Ref<MenuItem[]>): void {
    // Skip items the user doesn't have permission to see
    if (!hasPermissionForItem(item)) return;

    if (item.title) {
      const standaloneItem = {
        ...item,
        title: createLocalizedTitle(item.title as string),
      } as MenuItem;
      upsert(constructedMenu.value, standaloneItem);
    }
  }

  /**
   * Finalizes menu items by adding IDs and sorting children
   * Also filters out groups with no visible children
   */
  function finalizeMenuItems(items: MenuItem[]): MenuItem[] {
    return (
      items
        .map(
          (item): MenuItem => ({
            ...item,
            title: createLocalizedTitle(item.title as string),
            id: item.id || createItemId(item.title as ComputedRef<string>),
            children: item.children?.filter((child) => hasPermissionForItem(child)).sort(sortByGroupPriority),
          }),
        )
        // Filter out groups with no visible children
        .filter((item) => !item.children || item.children.length > 0)
        .sort(sortByPriority)
    );
  }

  /**
   * Constructs the complete menu structure from raw menu items
   */
  function constructMenu(): void {
    const constructedMenu: Ref<MenuItem[]> = ref([]);

    // Process each raw menu item
    rawMenu.value.forEach((item) => {
      if (item.group || item.groupId) {
        processGroupItem(item, constructedMenu);
      } else {
        processStandaloneItem(item, constructedMenu);
      }
    });

    // Finalize and set the menu items
    menuItems.value = finalizeMenuItems(constructedMenu.value);
  }

  // Process any pre-registered menu items, including those with group configurations
  preregisteredMenuItems.value.forEach((item) => {
    try {
      addMenuItem(item);
    } catch (e) {
      console.warn(`Failed to register preregistered menu item ${item.id || item.title}:`, e);
    }
  });

  return {
    addMenuItem,
    menuItems,
    removeMenuItem,
    updateMenuItem,
    getMenuItem,
    createMenuItemConfig,
    updateMenuItemConfig,
    removeMenuItemConfig,
    getMenuItemConfigs,
  };
}
