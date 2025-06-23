import { ref, computed, Component, ComputedRef } from "vue";

export interface ISettingsMenuItem {
  id: string;
  order?: number;
  component: Component;
  props?: Record<string, unknown>;
}

export interface RegisterSettingsMenuItemOptions extends Omit<ISettingsMenuItem, "id"> {
  id?: string;
}

export interface ISettingsMenuService {
  register: (options: RegisterSettingsMenuItemOptions) => string;
  unregister: (id: string) => void;
  items: ComputedRef<ISettingsMenuItem[]>;
}

// Global state for pre-registering settings menu items
const preregisteredSettingsMenuItems: ISettingsMenuItem[] = [];
const settingsMenuItems = ref<Map<string, ISettingsMenuItem>>(new Map());

/**
 * Registers a settings menu item before the service is initialized
 */
export function addSettingsMenuItem(item: RegisterSettingsMenuItemOptions): void {
  const id = item.id || crypto.randomUUID();
  preregisteredSettingsMenuItems.push({
    id,
    order: item.order ?? preregisteredSettingsMenuItems.length,
    component: item.component,
    props: item.props,
  });
}

/**
 * Creates a settings menu service
 * Manages the registration and organization of settings menu items
 */
export function createSettingsMenuService(): ISettingsMenuService {
  const register = (options: RegisterSettingsMenuItemOptions): string => {
    const id = options.id || crypto.randomUUID();
    settingsMenuItems.value.set(id, {
      id,
      order: options.order ?? settingsMenuItems.value.size,
      component: options.component,
      props: options.props,
    });
    return id;
  };

  const unregister = (id: string): void => {
    settingsMenuItems.value.delete(id);
  };

  const items = computed<ISettingsMenuItem[]>(() => {
    return Array.from(settingsMenuItems.value.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Register pre-added settings menu items
  preregisteredSettingsMenuItems.forEach((item) => {
    try {
      register(item);
    } catch (e) {
      console.warn(`Failed to register pre-added settings menu item ${item.id}:`, e);
    }
  });

  return {
    register,
    unregister,
    items,
  };
}
