import { inject, computed, getCurrentInstance, onBeforeUnmount } from "vue";
import { ToolbarServiceKey } from "@framework/injection-keys";
import { IToolbarItem, IToolbarService, createToolbarService, toolbarBus } from "@core/services/toolbar-service";
import { FALLBACK_BLADE_ID } from "@core/constants";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { createServiceRegistry } from "@core/composables/createServiceRegistry";

// Global toolbar service (if not provided through provide/inject)
let globalToolbarService: IToolbarService | null = null;

export interface UseToolbarOptions {
  /**
   * Clears all toolbar items for the current blade on component unmount.
   * Enabled by default for backward compatibility.
   */
  autoCleanup?: boolean;
}

export interface UseToolbarReturn {
  registerToolbarItem: (toolbarItem: IToolbarItem, targetBladeId?: string) => void;
  unregisterToolbarItem: (toolbarItemId: string, targetBladeId?: string) => void;
  updateToolbarItem: (id: string, toolbarItem: Partial<IToolbarItem>, targetBladeId?: string) => void;
  getToolbarItems: (targetBladeId?: string) => IToolbarItem[];
  clearBladeToolbarItems: (targetBladeId?: string) => void;
  isToolbarItemRegistered: IToolbarService["isToolbarItemRegistered"];
  registeredToolbarItems: IToolbarService["registeredToolbarItems"];
}

const registry = createServiceRegistry<IToolbarService>({
  key: ToolbarServiceKey,
  create: createToolbarService,
  bus: toolbarBus,
  name: "ToolbarService",
});

/**
 * Provides the toolbar service to the current component tree.
 *
 * Redundant inside a shell app: `VirtoShellFramework` already provides it via
 * `createAndProvideServices`, so this returns the existing instance. Use it when
 * bootstrapping an isolated tree (stories, tests) that has not installed the framework,
 * the same way as `provideWidgetService` and `provideDashboardService`.
 */
export function provideToolbarService(): IToolbarService {
  return registry.provide();
}

/**
 * Composable for working with the toolbar
 * @returns Methods for managing toolbar buttons
 */
export function useToolbar(options: UseToolbarOptions = {}): UseToolbarReturn {
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
  const descriptor = inject(BladeDescriptorKey, undefined);

  const bladeId = computed(() => descriptor?.value?.id ?? FALLBACK_BLADE_ID);

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
