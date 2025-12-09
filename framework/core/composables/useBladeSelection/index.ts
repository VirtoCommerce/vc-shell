import { inject, provide, getCurrentInstance, onBeforeUnmount, computed, ComputedRef } from "vue";
import { createBladeSelectionService } from "../../services/blade-selection-service";
import { BladeSelectionServiceKey, BladeInstanceKey } from "../../../injection-keys";
import { IBladeSelectionService, ISelectedItem } from "../../types/ai-agent";
import { createLogger, InjectionError } from "../../utilities";
import { FALLBACK_BLADE_ID } from "../../constants";

const logger = createLogger("use-blade-selection");

/**
 * Provides the blade selection service at the current component level.
 * Should be called once at the app level (in VcApp).
 */
export function provideBladeSelectionService(): IBladeSelectionService {
  const service = createBladeSelectionService();
  provide(BladeSelectionServiceKey, service);
  logger.debug("BladeSelectionService provided");
  return service;
}

/**
 * Return type for useBladeSelection composable
 */
export interface UseBladeSelectionReturn {
  /** All selections grouped by blade ID */
  allSelections: IBladeSelectionService["selections"];
  /** Flattened array of all selected items */
  allSelectedItems: IBladeSelectionService["allSelectedItems"];
  /** Total count of selected items */
  totalSelectedCount: IBladeSelectionService["totalSelectedCount"];
  /** Current blade's selected items */
  currentBladeSelection: ComputedRef<ISelectedItem[]>;
  /** Set selection for current blade */
  setSelection: <T extends { id?: string }>(items: T[], itemType: string) => void;
  /** Add item to current blade's selection */
  addToSelection: (item: ISelectedItem) => void;
  /** Remove item from current blade's selection */
  removeFromSelection: (itemId: string) => void;
  /** Clear current blade's selection */
  clearCurrentBladeSelection: () => void;
  /** Clear all selections from all blades */
  clearAllSelections: () => void;
  /** Get selection for a specific blade by ID */
  getBladeSelection: IBladeSelectionService["getBladeSelection"];
}

/**
 * Composable for managing blade selection state.
 *
 * Features:
 * - Access to global selection state across all blades
 * - Automatic cleanup when blade unmounts
 * - Helpers for current blade's selection
 *
 * @example
 * ```typescript
 * const { setSelection, totalSelectedCount } = useBladeSelection();
 *
 * // When VcTable selection changes
 * const onSelectionChanged = (items: IOffer[]) => {
 *   selectedIds.value = items.map(i => i.id);
 *   setSelection(items, "IOffer");
 * };
 * ```
 */
export function useBladeSelection(): UseBladeSelectionReturn {
  const service = inject(BladeSelectionServiceKey);
  if (!service) {
    logger.error("BladeSelectionService not found. Did you forget to call provideBladeSelectionService()?");
    throw new InjectionError("BladeSelectionService");
  }

  // Get current blade context
  const blade = inject(
    BladeInstanceKey,
    computed(() => ({
      id: FALLBACK_BLADE_ID,
      expandable: false,
      maximized: false,
      error: undefined,
      navigation: undefined,
      breadcrumbs: undefined,
      title: undefined,
    })),
  );

  // Current blade identifiers
  const bladeId = computed(() => blade.value?.id ?? FALLBACK_BLADE_ID);
  const bladeName = computed(() => (blade.value?.title as string) ?? bladeId.value);

  // Current blade's selection
  const currentBladeSelection = computed(() => service.getBladeSelection(bladeId.value)?.items ?? []);

  /**
   * Set selection for current blade
   * Converts generic items to ISelectedItem format
   */
  const setSelection = <T extends { id?: string }>(items: T[], itemType: string): void => {
    const selectedItems: ISelectedItem[] = items
      .filter((item) => item.id) // Only items with id
      .map((item) => ({
        id: item.id!,
        type: itemType,
        data: item as Record<string, unknown>,
        bladeId: bladeId.value,
        selectedAt: Date.now(),
      }));

    service.setSelection(bladeId.value, bladeName.value, selectedItems);
  };

  /**
   * Add single item to current blade's selection
   */
  const addToSelection = (item: ISelectedItem): void => {
    service.addToSelection(bladeId.value, bladeName.value, item);
  };

  /**
   * Remove single item from current blade's selection
   */
  const removeFromSelection = (itemId: string): void => {
    service.removeFromSelection(bladeId.value, itemId);
  };

  /**
   * Clear current blade's selection
   */
  const clearCurrentBladeSelection = (): void => {
    service.clearBladeSelection(bladeId.value);
  };

  // Auto-cleanup when blade unmounts
  const instance = getCurrentInstance();
  if (instance) {
    onBeforeUnmount(() => {
      logger.debug(`Auto-clearing selection for blade "${bladeId.value}" on unmount`);
      service.clearBladeSelection(bladeId.value);
    });
  }

  return {
    // Global state
    allSelections: service.selections,
    allSelectedItems: service.allSelectedItems,
    totalSelectedCount: service.totalSelectedCount,

    // Current blade helpers
    currentBladeSelection,
    setSelection,
    addToSelection,
    removeFromSelection,
    clearCurrentBladeSelection,

    // Service methods
    clearAllSelections: service.clearAllSelections,
    getBladeSelection: service.getBladeSelection,
  };
}
