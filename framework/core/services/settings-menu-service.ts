import { ComputedRef } from "vue";
import { createSimpleMapRegistry, createPreregistrationBus } from "./_internal";

export interface ISettingsMenuItem {
  id: string;
  order?: number;
  component: import("vue").Component;
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

export const settingsMenuBus = createPreregistrationBus<RegisterSettingsMenuItemOptions, ISettingsMenuService>({
  name: "settings-menu-service",
  getKey: (item) => item.id || crypto.randomUUID(),
  registerIntoService: (service, item) => service.register(item),
});

/**
 * Registers a settings menu item before the service is initialized
 */
export function addSettingsMenuItem(item: RegisterSettingsMenuItemOptions): void {
  settingsMenuBus.preregister(item);
}

/**
 * Creates a settings menu service
 * Manages the registration and organization of settings menu items
 */
export function createSettingsMenuService(): ISettingsMenuService {
  const mapRegistry = createSimpleMapRegistry<ISettingsMenuItem, RegisterSettingsMenuItemOptions>({
    createItem: (options, currentSize) => ({
      id: options.id || "",
      order: options.order ?? currentSize,
      component: options.component,
      props: options.props,
    }),
    getId: (options) => options.id || "",
  });

  const service: ISettingsMenuService = {
    register: (options) => mapRegistry.register(options),
    unregister: (id) => mapRegistry.unregister(id),
    items: mapRegistry.sortedItems,
  };

  settingsMenuBus.replayInto(service);

  return service;
}
