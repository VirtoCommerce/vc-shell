import { reactive } from "vue";
import { IBladeToolbar } from "../types";

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

// Global state for pre-registering toolbar buttons
const preregisteredToolbarItems: IToolbarRegistration[] = [];
const preregisteredIds = new Set<string>();

/**
 * Registers a toolbar button before the service is initialized
 */
export function registerToolbarItem(toolbarItem: IToolbarItem, bladeId: string): void {
  const normalizedBladeId = bladeId.toLowerCase();
  preregisteredToolbarItems.push({ bladeId: normalizedBladeId, toolbarItem });
  preregisteredIds.add(toolbarItem.id);
}

export function createToolbarService(): IToolbarService {
  const toolbarRegistry = reactive<Record<string, IToolbarItem[]>>({});
  const registeredToolbarItems = reactive<IToolbarRegistration[]>([]);
  const registeredIds = reactive(new Set<string>());

  const registerToolbarItem = (toolbarItem: IToolbarItem, bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (!toolbarRegistry[normalizedBladeId]) {
      toolbarRegistry[normalizedBladeId] = [];
    }

    const existingIndex = toolbarRegistry[normalizedBladeId].findIndex((t) => t.id === toolbarItem.id);
    if (existingIndex === -1) {
      toolbarRegistry[normalizedBladeId].push(reactive(toolbarItem));
      registeredToolbarItems.push({ bladeId: normalizedBladeId, toolbarItem: reactive(toolbarItem) });
      registeredIds.add(toolbarItem.id);
    }
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
    const normalizedBladeId = bladeId.toLowerCase();

    if (toolbarRegistry[normalizedBladeId]) {
      const index = toolbarRegistry[normalizedBladeId].findIndex((t) => t.id === id);
      if (index !== -1) {
        toolbarRegistry[normalizedBladeId][index] = { ...toolbarRegistry[normalizedBladeId][index], ...toolbarItem };
      }
    }
  };

  const unregisterToolbarItem = (toolbarItemId: string, bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (toolbarRegistry[normalizedBladeId]) {
      const index = toolbarRegistry[normalizedBladeId].findIndex((t) => t.id === toolbarItemId);
      if (index !== -1) {
        toolbarRegistry[normalizedBladeId].splice(index, 1);
        registeredIds.delete(toolbarItemId);
      }
    }

    const regIndex = registeredToolbarItems.findIndex(
      (t) => t.bladeId === normalizedBladeId && t.toolbarItem.id === toolbarItemId,
    );
    if (regIndex !== -1) {
      registeredToolbarItems.splice(regIndex, 1);
    }
  };

  const getToolbarItems = (bladeId: string): IToolbarItem[] => {
    const normalizedBladeId = bladeId ? bladeId.toLowerCase() : "";
    const bladeItems = toolbarRegistry[normalizedBladeId] || [];

    // Include global toolbar items registered with "*" (wildcard)
    const globalItems = toolbarRegistry["*"] || [];

    // Merge items, avoiding duplicates by id
    const result = [...bladeItems];
    const existingIds = new Set(result.map((item) => item.id));

    globalItems.forEach((item) => {
      if (!existingIds.has(item.id)) {
        result.push(item);
      }
    });

    return result;
  };

  const clearBladeToolbarItems = (bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (toolbarRegistry[normalizedBladeId]) {
      toolbarRegistry[normalizedBladeId].forEach((toolbarItem) => {
        registeredIds.delete(toolbarItem.id);
      });
      delete toolbarRegistry[normalizedBladeId];
    }

    const indices = registeredToolbarItems
      .map((t, i) => (t.bladeId === normalizedBladeId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();

    indices.forEach((index) => {
      registeredToolbarItems.splice(index, 1);
    });
  };

  const isToolbarItemRegistered = (id: string): boolean => {
    return registeredIds.has(id);
  };

  // Register pre-registered toolbar buttons
  preregisteredToolbarItems.forEach((item) => {
    try {
      registerToolbarItem(item.toolbarItem, item.bladeId);
    } catch (e) {
      console.warn(`[toolbar-service] Failed to register preregistered toolbar item ${item.toolbarItem.id}:`, e);
    }
  });

  return {
    registerToolbarItem,
    unregisterToolbarItem,
    getToolbarItems,
    clearBladeToolbarItems,
    registeredToolbarItems,
    isToolbarItemRegistered,
    updateToolbarItem,
  };
}
