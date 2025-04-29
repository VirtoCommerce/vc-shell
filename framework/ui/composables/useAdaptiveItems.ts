import { ref, computed, onMounted, onBeforeUnmount, nextTick, type Ref, watch } from "vue";
import { useElementSize } from "@vueuse/core";

export function useAdaptiveItems<T>(options: {
  containerRef: Ref<HTMLElement | null>;
  items: Ref<T[]>;
  getItemKey: (item: T) => string;
  moreButtonWidth: number;
  calculationStrategy?: "forward" | "reverse";
  initialItemWidth?: number;
}) {
  const {
    containerRef,
    items,
    getItemKey,
    moreButtonWidth,
    calculationStrategy = "forward",
    initialItemWidth = 50,
  } = options;

  // Size container
  const { width: containerWidth } = useElementSize(containerRef);

  // Store element sizes by key
  const itemSizes = ref<Map<string, number>>(new Map());

  // Result arrays
  const visibleItems = ref<T[]>([]);
  const hiddenItems = ref<T[]>([]);
  const showMoreButton = computed(() => hiddenItems.value.length > 0);

  // ResizeObserver for tracking element size changes
  let elementsObserver: ResizeObserver | null = null;

  /**
   * Get element width by key
   * If size not found, return approximate width
   */
  const getItemWidth = (item: T): number => {
    const key = getItemKey(item);
    return itemSizes.value.get(key) || initialItemWidth;
  };

  /**
   * Calculate which elements will be visible,
   * and which will be hidden
   */
  const calculateVisibleItems = () => {
    if (!containerRef.value || !items.value.length) return;

    // Available width with account "More" button
    const availableWidth = containerWidth.value - (showMoreButton.value ? moreButtonWidth : 0);

    let currentWidth = 0;
    const visible: T[] = [];
    const hidden: T[] = [];

    // Apply selected strategy
    const itemsToCheck = calculationStrategy === "reverse" ? [...items.value].reverse() : items.value;

    for (const item of itemsToCheck) {
      const itemWidth = getItemWidth(item);

      if (currentWidth + itemWidth <= availableWidth) {
        visible.push(item);
        currentWidth += itemWidth;
      } else {
        hidden.push(item);
      }
    }

    // If reverse strategy is used, reverse arrays
    if (calculationStrategy === "reverse") {
      visibleItems.value = visible.reverse();
      hiddenItems.value = hidden.reverse();
    } else {
      visibleItems.value = visible;
      hiddenItems.value = hidden;
    }
  };

  /**
   * Measure element widths and update size cache
   */
  const measureElementSizes = () => {
    if (!containerRef.value) return;

    // Find all elements inside container with data-item-key attribute
    const elements = containerRef.value.querySelectorAll("[data-item-key]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-item-key");

      if (key) {
        const htmlElement = element as HTMLElement;
        const styles = getComputedStyle(htmlElement);
        const width =
          htmlElement.offsetWidth + parseFloat(styles.marginLeft || "0") + parseFloat(styles.marginRight || "0");

        // Save size to cache
        itemSizes.value.set(key, width);
      }
    });

    // Recalculate visible items with new measurements
    calculateVisibleItems();
  };

  /**
   * Setup ResizeObserver for tracking element size changes
   */
  const setupElementsObserver = () => {
    if (elementsObserver) {
      elementsObserver.disconnect();
    }

    // Create new ResizeObserver
    elementsObserver = new ResizeObserver((entries) => {
      // Check if sizes have changed
      let hasChanges = false;

      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const key = element.getAttribute("data-item-key");

        if (key) {
          const styles = getComputedStyle(element);
          const width =
            element.offsetWidth + parseFloat(styles.marginLeft || "0") + parseFloat(styles.marginRight || "0");

          // If size has changed, update cache
          if (itemSizes.value.get(key) !== width) {
            itemSizes.value.set(key, width);
            hasChanges = true;
          }
        }
      });

      // If there are changes, recalculate
      if (hasChanges) {
        calculateVisibleItems();
      }
    });

    // Update current measurements and setup observation
    nextTick(() => {
      if (!containerRef.value) return;

      // Find all elements to observe
      const elements = containerRef.value.querySelectorAll("[data-item-key]");

      elements.forEach((element) => {
        elementsObserver?.observe(element);
      });

      // Make initial measurement
      measureElementSizes();
    });
  };

  // Recalculate when container width changes
  watch(containerWidth, () => {
    calculateVisibleItems();
  });

  // Recalculate when list of items changes
  watch(
    () => items.value,
    () => {
      nextTick(() => {
        setupElementsObserver();
        calculateVisibleItems();
      });
    },
    { deep: true },
  );

  // Initialize when mounted
  onMounted(() => {
    nextTick(() => {
      // Measure element sizes
      measureElementSizes();

      // Setup observer for size changes
      setupElementsObserver();
    });
  });

  // Cleanup resources when unmounted
  onBeforeUnmount(() => {
    if (elementsObserver) {
      elementsObserver.disconnect();
      elementsObserver = null;
    }
  });

  return {
    visibleItems,
    hiddenItems,
    showMoreButton,
    recalculate: () => {
      nextTick(() => {
        measureElementSizes();
        calculateVisibleItems();
      });
    },
    // Export function for updating observer
    updateObserver: setupElementsObserver,
  };
}