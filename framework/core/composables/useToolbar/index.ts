import { inject, provide, computed, getCurrentInstance, getCurrentScope, onBeforeUnmount, onScopeDispose } from "vue";
import type { ComputedRef } from "vue";
import { BladeInstance, ToolbarServiceKey } from "@framework/injection-keys";
import { IToolbarItem, IToolbarService, createToolbarService, toolbarBus } from "@core/services/toolbar-service";
import { FALLBACK_BLADE_ID } from "@core/constants";
import type { IBladeInstance } from "@shared/components/blade-navigation/types";

// Global toolbar service (if not provided through provide/inject)
let globalToolbarService: IToolbarService | null = null;

export interface UseToolbarOptions {
  /**
   * Clears all toolbar items for the current blade on component unmount.
   * Enabled by default for backward compatibility.
   */
  autoCleanup?: boolean;
}

export function provideToolbarService(): IToolbarService {
  const existingService = inject(ToolbarServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createToolbarService();
  provide(ToolbarServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => toolbarBus.dispose(service));
  }

  return service;
}

/**
 * Composable for working with the toolbar
 * @returns Methods for managing toolbar buttons
 */
export function useToolbar(options: UseToolbarOptions = {}) {
  const { autoCleanup = true } = options;

  // Try to get the service from dependency injection
  const toolbarService = inject<IToolbarService | null>(ToolbarServiceKey, null);

  // If the service is not injected, create a global one
  if (!toolbarService && !globalToolbarService) {
    globalToolbarService = createToolbarService();
  }

  const service = toolbarService || globalToolbarService;

  if (!service) {
    throw new Error("Toolbar service is not available");
  }

  // Get the ID of the current blade
  const blade = inject<ComputedRef<IBladeInstance>>(
    BladeInstance,
    computed(() => ({
      id: FALLBACK_BLADE_ID,
      expandable: false,
      maximized: false,
      error: undefined,
      navigation: undefined,
      breadcrumbs: undefined,
    })),
  );

  const bladeId = computed(() => blade.value?.id ?? FALLBACK_BLADE_ID);

  // Functions for working with the toolbar
  /**
   * Registers a toolbar button
   * @param toolbarItem - Toolbar button object
   * @param toolbarItem.id - Unique identifier of the button
   * @param toolbarItem.priority - Button priority (higher - more important, displayed at the beginning). Default is 0.
   */
  const resolveBladeId = (targetBladeId?: string): string => targetBladeId ?? bladeId.value;

  const registerToolbarItem = (toolbarItem: IToolbarItem, targetBladeId?: string) => {
    service.registerToolbarItem(toolbarItem, resolveBladeId(targetBladeId));
  };

  const unregisterToolbarItem = (toolbarItemId: string, targetBladeId?: string) => {
    service.unregisterToolbarItem(toolbarItemId, resolveBladeId(targetBladeId));
  };

  const updateToolbarItem = (id: string, toolbarItem: Partial<IToolbarItem>, targetBladeId?: string) => {
    service.updateToolbarItem({ id, bladeId: resolveBladeId(targetBladeId), toolbarItem });
  };

  const getToolbarItems = (targetBladeId?: string) => {
    return service.getToolbarItems(resolveBladeId(targetBladeId));
  };

  const clearBladeToolbarItems = (targetBladeId?: string) => {
    service.clearBladeToolbarItems(resolveBladeId(targetBladeId));
  };

  // Automatic cleanup when the component is unmounted
  const instance = getCurrentInstance();
  if (instance && autoCleanup) {
    onBeforeUnmount(() => {
      clearBladeToolbarItems();
    });
  }

  return {
    registerToolbarItem,
    unregisterToolbarItem,
    updateToolbarItem,
    getToolbarItems,
    clearBladeToolbarItems,
    isToolbarItemRegistered: service.isToolbarItemRegistered,
    registeredToolbarItems: service.registeredToolbarItems,
  };
}
