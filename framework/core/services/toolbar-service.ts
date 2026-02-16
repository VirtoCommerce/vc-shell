import { IBladeToolbar } from "../types";
import { createBladeScopedRegistry, createPreregistrationBus } from "./_internal";

export interface IToolbarItem extends IBladeToolbar {
  id: string;
  bladeId?: string;
  priority?: number;
}

export interface IToolbarRegistration {
  bladeId: string;
  toolbarItem: IToolbarItem;
}

export interface IToolbarService {
  registerToolbarItem: (toolbarItem: IToolbarItem, bladeId: string) => void;
  unregisterToolbarItem: (toolbarItemId: string, bladeId: string) => void;
  getToolbarItems: (bladeId: string) => IToolbarItem[];
  clearBladeToolbarItems: (bladeId: string) => void;
  registeredToolbarItems: IToolbarRegistration[];
  isToolbarItemRegistered: (id: string) => boolean;
  updateToolbarItem: ({
    id,
    bladeId,
    toolbarItem,
  }: {
    id: string;
    bladeId: string;
    toolbarItem: Partial<IToolbarItem>;
  }) => void;
}

export const toolbarBus = createPreregistrationBus<IToolbarRegistration, IToolbarService>({
  name: "toolbar-service",
  getKey: (reg) => `${reg.bladeId.toLowerCase()}::${reg.toolbarItem.id}`,
  registerIntoService: (service, reg) => service.registerToolbarItem(reg.toolbarItem, reg.bladeId),
});

/**
 * Registers a toolbar button before the service is initialized.
 */
export function registerToolbarItem(toolbarItem: IToolbarItem, bladeId: string): void {
  const normalizedBladeId = bladeId.toLowerCase();
  toolbarBus.preregister({
    bladeId: normalizedBladeId,
    toolbarItem,
  });
}

export function createToolbarService(): IToolbarService {
  const bladeRegistry = createBladeScopedRegistry<IToolbarItem, IToolbarRegistration>({
    createRegistration: (bladeId, item) => ({ bladeId, toolbarItem: item }),
    getRegistrationBladeId: (r) => r.bladeId,
    getRegistrationItemId: (r) => r.toolbarItem.id,
  });

  const registerToolbarItem = (toolbarItem: IToolbarItem, bladeId: string): void => {
    bladeRegistry.register(toolbarItem, bladeId);
  };

  const unregisterToolbarItem = (toolbarItemId: string, bladeId: string): void => {
    bladeRegistry.unregister(toolbarItemId, bladeId);
  };

  const getToolbarItems = (bladeId: string): IToolbarItem[] => {
    const normalizedBladeId = bladeId ? bladeId.toLowerCase() : "";
    const bladeItems = bladeRegistry.get(normalizedBladeId);
    const globalItems = bladeRegistry.get("*");

    const result: IToolbarItem[] = [...bladeItems];
    const existingIds = new Set(result.map((item) => item.id));

    globalItems.forEach((item) => {
      if (!existingIds.has(item.id)) {
        result.push(item);
      }
    });

    return [...result];
  };

  const clearBladeToolbarItems = (bladeId: string): void => {
    bladeRegistry.clear(bladeId);
  };

  const updateToolbarItem = ({
    id,
    bladeId,
    toolbarItem,
  }: {
    id: string;
    bladeId: string;
    toolbarItem: Partial<IToolbarItem>;
  }): void => {
    bladeRegistry.update(id, bladeId, toolbarItem);
  };

  const service: IToolbarService = {
    registerToolbarItem,
    unregisterToolbarItem,
    getToolbarItems,
    clearBladeToolbarItems,
    registeredToolbarItems: bladeRegistry.registrations,
    isToolbarItemRegistered: (id) => bladeRegistry.isRegistered(id),
    updateToolbarItem,
  };

  toolbarBus.replayInto(service);

  return service;
}
