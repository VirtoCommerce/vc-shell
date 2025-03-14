import { Component, computed, ComputedRef, ref, watch, type Ref } from "vue";
import * as _ from "lodash-es";
import { i18n } from "./../plugins/i18n";
import type { MenuItem } from "../types";
import { createUnrefFn, useArrayFind } from "@vueuse/core";

// Global state for pre-registering menu items
const preregisteredMenuItems: Ref<MenuItem[]> = ref([]);

/**
 * Registers a menu item before the service is initialized
 */
export function addMenuItem(item: MenuItem): void {
  preregisteredMenuItems.value.push(item);
}

export interface MenuService {
  addMenuItem: (item: MenuItem) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
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
    const index = menuItems.value.indexOf(item);
    if (index !== -1) {
      menuItems.value.splice(index, 1);
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
      title: createLocalizedTitle(item.title as string),
    } as MenuItem;

    if (existingGroup.value && existingGroup.value.children) {
      // Add to existing group
      upsert(existingGroup.value.children, groupItem);

      // Update existing group properties if using groupConfig
      if (item.groupConfig) {
        if (item.groupConfig.title) {
          existingGroup.value.title = createLocalizedTitle(item.groupConfig.title);
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
        title: createLocalizedTitle(groupTitle),
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
        title: createLocalizedTitle(item.title as string),
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
          title: createLocalizedTitle(item.title as string),
          id: item.id || createItemId(item.title as ComputedRef<string>),
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
  };
}
