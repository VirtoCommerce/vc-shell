import { ref, computed, ComputedRef, Ref } from "vue";

/**
 * Base interface for items that can be controlled through toggling
 */
export interface ToggleableItem {
  id: string;
}

/**
 * Creates a content manager with basic operations
 *
 * @param itemsGetter - function to get the array of items
 * @param activeIdRef - reference for storing the active item ID
 * @returns object with methods and computed properties for managing content
 */
export function useToggleableContent<T extends ToggleableItem>(
  itemsGetter: ComputedRef<T[] | null | undefined>,
  activeIdRef: Ref<string | null>,
) {
  // Get the current active item directly from the array of items
  const currentItem = computed(() => {
    if (!activeIdRef.value || !Array.isArray(itemsGetter.value)) {
      return null;
    }

    return itemsGetter.value.find((item) => item.id === activeIdRef.value) || null;
  });

  // Check if any item is visible
  const isAnyItemVisible = computed(() => activeIdRef.value !== null);

  // Activate/deactivate item
  const toggleItem = (id: string) => {
    // If already active, hide
    if (activeIdRef.value === id) {
      activeIdRef.value = null;
    } else {
      // Otherwise, show
      activeIdRef.value = id;
    }
  };

  const closeItem = () => {
    activeIdRef.value = null;
  };

  // Show specific item
  const showItem = (id: string) => {
    activeIdRef.value = id;
  };

  // Hide all items
  const hideAllItems = () => {
    activeIdRef.value = null;
  };

  return {
    showItem,
    hideAllItems,
    toggleItem,
    currentItem,
    isAnyItemVisible,
    closeItem,
  };
}
