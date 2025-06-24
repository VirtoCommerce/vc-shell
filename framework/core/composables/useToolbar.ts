import { ComputedRef, computed, getCurrentInstance, inject, onBeforeUnmount } from "vue";
import { BladeInstance, TOOLBAR_SERVICE } from "../../injection-keys";
import { IToolbarItem, IToolbarService, createToolbarService } from "../services/toolbar-service";
import { FALLBACK_BLADE_ID } from "../constants";
import { IBladeInstance } from "../../shared/components/blade-navigation/types";

// Global toolbar service (if not provided through provide/inject)
let globalToolbarService: IToolbarService | null = null;

/**
 * Composable for working with the toolbar
 * @returns Methods for managing toolbar buttons
 */
export function useToolbar() {
  // Try to get the service from dependency injection
  const toolbarService = inject<IToolbarService | null>(TOOLBAR_SERVICE, null);

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
  const registerToolbarItem = (toolbarItem: IToolbarItem) => {
    service.registerToolbarItem(toolbarItem, bladeId.value);
  };

  const unregisterToolbarItem = (toolbarItemId: string) => {
    service.unregisterToolbarItem(toolbarItemId, bladeId.value);
  };

  const updateToolbarItem = (id: string, toolbarItem: Partial<IToolbarItem>) => {
    service.updateToolbarItem({ id, bladeId: bladeId.value, toolbarItem });
  };

  const getToolbarItems = () => {
    return service.getToolbarItems(bladeId.value);
  };

  const clearBladeToolbarItems = () => {
    service.clearBladeToolbarItems(bladeId.value);
  };

  // Automatic cleanup when the component is unmounted
  const instance = getCurrentInstance();
  if (instance) {
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
