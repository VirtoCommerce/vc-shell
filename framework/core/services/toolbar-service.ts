import type { IBladeToolbar } from "@core/types";
import { createBladeScopedRegistry, createPreregistrationBus } from "@core/services/_internal";

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
  getToolbarItems: (bladeId: string, bladeName?: string) => IToolbarItem[];
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

export interface IExternalToolbarItemRegistration extends Omit<IToolbarItem, "bladeId"> {
  /** Blade names (the `name` from `defineBlade`), case-insensitive. */
  targetBlades: string[];
}

/**
 * Adds a toolbar button to blades owned by other modules, matched by blade name.
 * The button shows on every open instance of each target blade.
 */
export function registerExternalToolbarItem({ targetBlades, ...toolbarItem }: IExternalToolbarItemRegistration): void {
  targetBlades.forEach((bladeName) => registerToolbarItem(toolbarItem, bladeName));
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

  /**
   * Items for a blade instance, plus items registered by its blade name
   * (e.g. `registerToolbarItem(item, "Products")` from a module), plus global "*" items.
   * On an id collision the instance item wins, then the name item.
   */
  const getToolbarItems = (bladeId: string, bladeName?: string): IToolbarItem[] => {
    const normalizedBladeId = bladeId ? bladeId.toLowerCase() : "";
    const normalizedBladeName = bladeName?.toLowerCase();

    const result: IToolbarItem[] = [...bladeRegistry.get(normalizedBladeId)];
    const existingIds = new Set(result.map((item) => item.id));

    const addMissing = (items: IToolbarItem[]) => {
      items.forEach((item) => {
        if (!existingIds.has(item.id)) {
          existingIds.add(item.id);
          result.push(item);
        }
      });
    };

    if (normalizedBladeName && normalizedBladeName !== normalizedBladeId) {
      addMissing(bladeRegistry.get(normalizedBladeName));
    }
    addMissing(bladeRegistry.get("*"));

    return result;
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
