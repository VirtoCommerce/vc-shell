import { useLocalStorage } from "@vueuse/core";
import type { DashboardWidgetPosition } from "../types";

/**
 * Hook for managing the saving and loading of the dashboard layout
 *
 * Provides functions for saving and loading the dashboard layout from localStorage
 *
 * @param storageKey The key for local storage
 * @param updateCallback The function for updating the position of the widget
 * @returns An object with functions for working with the saved layout
 */
export function useLayoutPersistence(
  storageKey: string,
  updateCallback: (widgetId: string, position: DashboardWidgetPosition) => void,
) {
  // Use useLocalStorage for working with localStorage
  const savedLayout = useLocalStorage<Record<string, DashboardWidgetPosition>>(storageKey, {});

  /**
   * Saves the current layout to localStorage
   *
   * @param layout The current layout to save
   */
  const saveLayout = (layout: Map<string, DashboardWidgetPosition>): void => {
    try {
      // Convert Map to an object for serialization
      const layoutData: Record<string, DashboardWidgetPosition> = {};

      layout.forEach((position, widgetId) => {
        layoutData[widgetId] = position;
      });

      // Save to localStorage through the reactive variable
      savedLayout.value = layoutData;
    } catch (error) {
      console.error("Failed to save dashboard layout to localStorage:", error);
    }
  };

  /**
   * Loads the saved layout from localStorage
   *
   * @param widgets The array of widgets to check for existence
   * @returns true if the layout was successfully loaded, false otherwise
   */
  const loadLayout = <T extends { id: string }>(widgets: T[]): boolean => {
    try {
      // Check for the existence of the saved layout
      if (!savedLayout.value || Object.keys(savedLayout.value).length === 0) {
        return false;
      }

      // Apply positions to existing widgets
      Object.entries(savedLayout.value).forEach(([widgetId, position]) => {
        const widget = widgets.find((w) => w.id === widgetId);
        if (widget) {
          updateCallback(widgetId, position);
        }
      });

      return true;
    } catch (error) {
      console.error("Failed to load dashboard layout from localStorage:", error);
      return false;
    }
  };

  /**
   * Clears the saved layout from localStorage
   */
  const clearSavedLayout = (): void => {
    savedLayout.value = {};
  };

  /**
   * Checks if there is a saved layout in localStorage
   */
  const hasSavedLayout = (): boolean => {
    return Object.keys(savedLayout.value).length > 0;
  };

  return {
    saveLayout,
    loadLayout,
    clearSavedLayout,
    hasSavedLayout,
  };
}
