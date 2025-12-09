import { computed, reactive } from "vue";
import { createLogger } from "../utilities";
import { IBladeSelectionService, IBladeSelectionState, ISelectedItem } from "../types/ai-agent";

const logger = createLogger("blade-selection-service");

/**
 * Creates a blade selection service for managing selection state across all blades.
 * Uses the provide/inject pattern similar to useWidgets.
 */
export function createBladeSelectionService(): IBladeSelectionService {
  // Reactive Map to store selections per blade
  const selectionsMap = reactive<Map<string, IBladeSelectionState>>(new Map());

  // Computed: selections as readonly
  const selections = computed(() => selectionsMap);

  // Computed: flattened array of all selected items
  const allSelectedItems = computed<ISelectedItem[]>(() => {
    const items: ISelectedItem[] = [];
    selectionsMap.forEach((state) => {
      items.push(...state.items);
    });
    return items;
  });

  // Computed: total count of selected items
  const totalSelectedCount = computed(() => allSelectedItems.value.length);

  /**
   * Set selection for a specific blade (replaces existing selection)
   */
  const setSelection = (bladeId: string, bladeName: string, items: ISelectedItem[]): void => {
    const normalizedBladeId = bladeId.toLowerCase();
    logger.debug(`setSelection for blade "${normalizedBladeId}":`, items.length, "items");

    if (items.length === 0) {
      // If no items, remove the blade entry entirely
      selectionsMap.delete(normalizedBladeId);
      return;
    }

    selectionsMap.set(normalizedBladeId, {
      bladeId: normalizedBladeId,
      bladeName,
      items: items.map((item) => ({
        ...item,
        bladeId: normalizedBladeId,
        selectedAt: item.selectedAt || Date.now(),
      })),
    });
  };

  /**
   * Add a single item to blade's selection
   */
  const addToSelection = (bladeId: string, bladeName: string, item: ISelectedItem): void => {
    const normalizedBladeId = bladeId.toLowerCase();
    const current = selectionsMap.get(normalizedBladeId);

    const newItem: ISelectedItem = {
      ...item,
      bladeId: normalizedBladeId,
      selectedAt: item.selectedAt || Date.now(),
    };

    if (current) {
      // Check if item already exists
      const exists = current.items.some((i) => i.id === item.id);
      if (!exists) {
        current.items.push(newItem);
        logger.debug(`Added item "${item.id}" to blade "${normalizedBladeId}"`);
      }
    } else {
      // Create new selection state for this blade
      selectionsMap.set(normalizedBladeId, {
        bladeId: normalizedBladeId,
        bladeName,
        items: [newItem],
      });
      logger.debug(`Created selection for blade "${normalizedBladeId}" with item "${item.id}"`);
    }
  };

  /**
   * Remove a single item from blade's selection
   */
  const removeFromSelection = (bladeId: string, itemId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();
    const current = selectionsMap.get(normalizedBladeId);

    if (current) {
      current.items = current.items.filter((i) => i.id !== itemId);
      logger.debug(`Removed item "${itemId}" from blade "${normalizedBladeId}"`);

      // If no items left, remove the blade entry
      if (current.items.length === 0) {
        selectionsMap.delete(normalizedBladeId);
      }
    }
  };

  /**
   * Clear all selections for a specific blade
   */
  const clearBladeSelection = (bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();
    const existed = selectionsMap.delete(normalizedBladeId);
    if (existed) {
      logger.debug(`Cleared selection for blade "${normalizedBladeId}"`);
    }
  };

  /**
   * Clear all selections from all blades
   */
  const clearAllSelections = (): void => {
    selectionsMap.clear();
    logger.debug("Cleared all selections");
  };

  /**
   * Get selection state for a specific blade
   */
  const getBladeSelection = (bladeId: string): IBladeSelectionState | undefined => {
    return selectionsMap.get(bladeId.toLowerCase());
  };

  return {
    selections,
    allSelectedItems,
    totalSelectedCount,
    setSelection,
    addToSelection,
    removeFromSelection,
    clearBladeSelection,
    clearAllSelections,
    getBladeSelection,
  };
}
