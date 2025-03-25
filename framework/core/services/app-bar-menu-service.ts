import { ref, computed, Component, ComputedRef } from "vue";

export interface AppBarWidget {
  id: string;
  order?: number;
  icon?: Component | string;
  component?: Component;
  props?: Record<string, unknown>;
  onClick?: () => void;
  slot?: string;
  badge?: boolean | (() => boolean);
}

export interface registerAppBarWidgetOptions extends Omit<AppBarWidget, "id"> {
  id?: string;
}

export interface IAppBarWidgetService {
  register: (options: registerAppBarWidgetOptions) => string;
  unregister: (id: string) => void;
  items: ComputedRef<AppBarWidget[]>;
}

// Global state for pre-registering AppBar menu items
const preregisteredAppBarMenuItems: AppBarWidget[] = [];
const appBarMenuItems = ref<Map<string, AppBarWidget>>(new Map());

/**
 * Registers an AppBar menu item before the service is initialized
 */
export function addAppBarWidget(item: registerAppBarWidgetOptions): void {
  const id = item.id || crypto.randomUUID();
  preregisteredAppBarMenuItems.push({
    id,
    order: item.order ?? preregisteredAppBarMenuItems.length,
    icon: item.icon,
    component: item.component,
    props: item.props,
    onClick: item.onClick,
    slot: item.slot,
    badge: item.badge,
  });
}

/**
 * Creates an AppBar menu service
 * Manages the registration and organization of AppBar menu items
 */
export function createAppBarWidgetService(): IAppBarWidgetService {
  const register = (options: registerAppBarWidgetOptions): string => {
    const id = options.id || crypto.randomUUID();
    appBarMenuItems.value.set(id, {
      id,
      order: options.order ?? appBarMenuItems.value.size,
      icon: options.icon,
      component: options.component,
      props: options.props,
      onClick: options.onClick,
      slot: options.slot,
      badge: options.badge,
    });
    return id;
  };

  const unregister = (id: string): void => {
    appBarMenuItems.value.delete(id);
  };

  const items = computed<AppBarWidget[]>(() => {
    return Array.from(appBarMenuItems.value.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Register pre-added widgets
  preregisteredAppBarMenuItems.forEach((item) => {
    try {
      register(item);
    } catch (e) {
      console.warn(`Failed to register pre-added AppBar widget ${item.id}:`, e);
    }
  });

  return {
    register,
    unregister,
    items,
  };
}
