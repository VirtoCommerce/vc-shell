import { reactive, ref, ComputedRef, Ref } from "vue";
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
  preregisteredToolbarItems.push({ bladeId, toolbarItem });
  preregisteredIds.add(toolbarItem.id);
}

export function createToolbarService(): IToolbarService {
  const toolbarRegistry = reactive<Record<string, IToolbarItem[]>>({});
  const registeredToolbarItems = reactive<IToolbarRegistration[]>([]);
  const registeredIds = reactive(new Set<string>());

  const registerToolbarItem = (toolbarItem: IToolbarItem, bladeId: string): void => {
    if (!toolbarRegistry[bladeId]) {
      toolbarRegistry[bladeId] = [];
    }

    const existingIndex = toolbarRegistry[bladeId].findIndex((t) => t.id === toolbarItem.id);
    if (existingIndex === -1) {
      toolbarRegistry[bladeId].push(reactive(toolbarItem));
      registeredToolbarItems.push({ bladeId, toolbarItem: reactive(toolbarItem) });
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
    if (toolbarRegistry[bladeId]) {
      const index = toolbarRegistry[bladeId].findIndex((t) => t.id === id);
      if (index !== -1) {
        toolbarRegistry[bladeId][index] = { ...toolbarRegistry[bladeId][index], ...toolbarItem };
      }
    }
  };

  const unregisterToolbarItem = (toolbarItemId: string, bladeId: string): void => {
    if (toolbarRegistry[bladeId]) {
      const index = toolbarRegistry[bladeId].findIndex((t) => t.id === toolbarItemId);
      if (index !== -1) {
        toolbarRegistry[bladeId].splice(index, 1);
        registeredIds.delete(toolbarItemId);
      }
    }

    const regIndex = registeredToolbarItems.findIndex(
      (t) => t.bladeId === bladeId && t.toolbarItem.id === toolbarItemId,
    );
    if (regIndex !== -1) {
      registeredToolbarItems.splice(regIndex, 1);
    }
  };

  const getToolbarItems = (bladeId: string): IToolbarItem[] => {
    return toolbarRegistry[bladeId] || [];
  };

  const clearBladeToolbarItems = (bladeId: string): void => {
    if (toolbarRegistry[bladeId]) {
      toolbarRegistry[bladeId].forEach((toolbarItem) => {
        registeredIds.delete(toolbarItem.id);
      });
      delete toolbarRegistry[bladeId];
    }

    const indices = registeredToolbarItems
      .map((t, i) => (t.bladeId === bladeId ? i : -1))
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
      console.warn(`Failed to register preregistered toolbar item ${item.toolbarItem.id}:`, e);
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
