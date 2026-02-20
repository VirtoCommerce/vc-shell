import { ComputedRef } from "vue";
import { createSimpleMapRegistry, createPreregistrationBus } from "@core/services/_internal";

export interface AppBarWidget {
  id: string;
  order?: number;
  title?: string;
  icon?: import("vue").Component | string;
  component?: import("vue").Component;
  props?: Record<string, unknown>;
  onClick?: () => void;
  slot?: string;
  badge?: boolean | (() => boolean);
  searchTerms?: string[];
}

export interface registerAppBarWidgetOptions extends Omit<AppBarWidget, "id"> {
  id?: string;
}

export interface IAppBarWidgetService {
  register: (options: registerAppBarWidgetOptions) => string;
  unregister: (id: string) => void;
  items: ComputedRef<AppBarWidget[]>;
}

export const appBarWidgetBus = createPreregistrationBus<registerAppBarWidgetOptions, IAppBarWidgetService>({
  name: "app-bar-menu-service",
  getKey: (item) => item.id || crypto.randomUUID(),
  registerIntoService: (service, item) => service.register(item),
  unregisterFromService: (service, id) => service.unregister(id),
});

/**
 * Registers an AppBar menu item before the service is initialized
 */
export function addAppBarWidget(item: registerAppBarWidgetOptions): void {
  appBarWidgetBus.preregister(item);
}

/**
 * Creates an AppBar menu service
 * Manages the registration and organization of AppBar menu items
 */
export function createAppBarWidgetService(): IAppBarWidgetService {
  const mapRegistry = createSimpleMapRegistry<AppBarWidget, registerAppBarWidgetOptions>({
    createItem: (options, currentSize) => ({
      id: options.id || "",
      order: options.order ?? currentSize,
      title: options.title,
      icon: options.icon,
      component: options.component,
      props: options.props,
      onClick: options.onClick,
      slot: options.slot,
      badge: options.badge,
      searchTerms: options.searchTerms,
    }),
    getId: (options) => options.id || "",
  });

  const service: IAppBarWidgetService = {
    register: (options) => mapRegistry.register(options),
    unregister: (id) => mapRegistry.unregister(id),
    items: mapRegistry.sortedItems,
  };

  appBarWidgetBus.replayInto(service);

  return service;
}
