import { ref, type Ref } from "vue";

/**
 * Size of the cell
 */
export interface CellSize {
  width: number;
  height: number;
}

/**
 * Constants for calculations
 */
const CELL_HEIGHT = 80; // Height of the cell, corresponds to the CSS variable --dashboard-cell-height
const HORIZONTAL_PADDING = 18; // Horizontal padding, corresponds to --dashboard-cell-gap-horizontal

/**
 * Hook for calculating the sizes of dashboard cells
 *
 * Provides functions for calculating the sizes of cells with respect to the container size
 * and caching for performance optimization
 *
 * @param gridColumns The number of columns in the grid
 * @returns An object with functions for working with cell sizes
 */
export function useCellSizeCalculator(gridColumns: number) {
  // Cache for cell sizes for performance optimization
  const cellSizeCache = ref<CellSize | null>(null);

  // Previous container width for performance optimization
  const previousContainerWidth = ref<number>(0);

  /**
   * Calculates the sizes of a cell based on the container size
   *
   * @param container The container element for calculating the sizes
   * @param useCache Use cache for optimization (default is true)
   * @returns The sizes of the cell
   */
  const calculateCellSize = (container: HTMLElement | null, useCache: boolean = true): CellSize => {
    // If we use cache and it is not empty - return the cached value
    if (useCache && cellSizeCache.value) return cellSizeCache.value;

    // If the container is not defined, return zero sizes
    if (!container) return { width: 0, height: CELL_HEIGHT };

    // Get the sizes of the container
    const rect = container.getBoundingClientRect();

    // Calculate the available width taking into account the padding
    const availableWidth = rect.width - 2 * HORIZONTAL_PADDING;

    // Calculate the width of the cell
    const cellWidth = availableWidth / gridColumns;

    // Create an object with sizes
    const size: CellSize = {
      width: Math.max(cellWidth, 0), // Protection against negative values
      height: CELL_HEIGHT,
    };

    // Update the cache
    cellSizeCache.value = size;
    previousContainerWidth.value = rect.width;

    return size;
  };

  /**
   * Clears the cache of cell sizes
   */
  const clearCache = (): void => {
    cellSizeCache.value = null;
  };

  /**
   * Checks if the sizes need to be recalculated based on the width change
   *
   * @param newWidth The new width of the container
   * @returns true if recalculation is needed, false otherwise
   */
  const shouldRecalculate = (newWidth: number): boolean => {
    if (previousContainerWidth.value === 0) return true;

    const widthChange = Math.abs(newWidth - previousContainerWidth.value);
    const widthChangePercent = (widthChange / previousContainerWidth.value) * 100;

    // Recalculate if the change is greater than 5% or 50px
    return widthChangePercent > 5 || widthChange > 50;
  };

  /**
   * Handles the change of the container size
   *
   * @param container The container element
   */
  const handleContainerResize = (container: HTMLElement): void => {
    if (!container) return;

    const newWidth = container.getBoundingClientRect().width;

    // Clear the cache for forced recalculation
    clearCache();

    // If the width has changed significantly, recalculate
    if (shouldRecalculate(newWidth)) {
      calculateCellSize(container, false);
    }

    // Update the previous width
    previousContainerWidth.value = newWidth;
  };

  return {
    calculateCellSize,
    clearCache,
    shouldRecalculate,
    handleContainerResize,
    previousContainerWidth,
  };
}
