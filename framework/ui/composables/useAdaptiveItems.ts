import { ref, computed, onMounted, onBeforeUnmount, nextTick, type Ref, watch } from "vue";
import { useElementSize, useDebounceFn } from "@vueuse/core";

/**
 * Measure the natural (unshrunk) width of an element.
 * Temporarily forces flex-shrink:0 so the browser reports the element's
 * preferred width rather than a compressed one.
 */
function measureNaturalWidth(element: HTMLElement): number {
  const originalFlexShrink = element.style.flexShrink;
  element.style.flexShrink = "0";

  const styles = getComputedStyle(element);
  const width =
    element.offsetWidth + parseFloat(styles.marginLeft || "0") + parseFloat(styles.marginRight || "0");

  element.style.flexShrink = originalFlexShrink;
  return width;
}

/**
 * Read the CSS gap value from a flex/grid container.
 */
function readContainerGap(container: HTMLElement): number {
  const styles = getComputedStyle(container);
  // `gap` is the shorthand; `columnGap` is more specific for row layouts
  const gap = styles.columnGap || styles.gap || "0px";
  return parseFloat(gap) || 0;
}

export function useAdaptiveItems<T>(options: {
  containerRef: Ref<HTMLElement | null>;
  items: Ref<T[]>;
  getItemKey: (item: T) => string;
  /** Fallback width for the "more" button before it can be measured from DOM.
   *  If the consumer marks its trigger element with `data-more-button`,
   *  the composable will auto-measure the real width and use it instead. */
  moreButtonWidth: number;
  calculationStrategy?: "forward" | "reverse";
  initialItemWidth?: number;
}) {
  const {
    containerRef,
    items,
    getItemKey,
    moreButtonWidth: moreButtonFallbackWidth,
    calculationStrategy = "forward",
    initialItemWidth = 50,
  } = options;

  // Container width tracking
  const { width: containerWidth } = useElementSize(containerRef);

  // Cache of natural element widths (key → px)
  const itemSizes = ref<Map<string, number>>(new Map());

  // Measured "more" button width (null = not yet measured, use fallback)
  const measuredMoreWidth = ref<number | null>(null);

  // Current CSS gap of the container
  const containerGap = ref(0);

  // Result arrays
  const visibleItems = ref<T[]>([]);
  const hiddenItems = ref<T[]>([]);
  const showMoreButton = computed(() => hiddenItems.value.length > 0);

  // Single persistent ResizeObserver
  let elementsObserver: ResizeObserver | null = null;
  // Track observed elements so we can unobserve stale ones
  const observedElements = new Set<Element>();

  /** Effective "more" button width: measured from DOM or fallback constant. */
  const getMoreButtonWidth = (): number => {
    return measuredMoreWidth.value ?? moreButtonFallbackWidth;
  };

  /**
   * Try to measure the "more" button from the DOM.
   * The consumer marks the trigger element with `data-more-button`.
   */
  const measureMoreButton = () => {
    if (!containerRef.value) return;
    const el = containerRef.value.querySelector("[data-more-button]") as HTMLElement | null;
    if (el) {
      const width = measureNaturalWidth(el);
      if (width > 0) {
        measuredMoreWidth.value = width;
      }
    }
  };

  /**
   * Get element width by key.
   * Falls back to initialItemWidth if not yet measured.
   */
  const getItemWidth = (item: T): number => {
    const key = getItemKey(item);
    return itemSizes.value.get(key) || initialItemWidth;
  };

  /**
   * Distribute items into visible/hidden arrays for a given available width,
   * accounting for CSS gap between items.
   */
  const distributeItems = (itemsToCheck: T[], availableWidth: number) => {
    let currentWidth = 0;
    const visible: T[] = [];
    const hidden: T[] = [];
    const gap = containerGap.value;

    for (const item of itemsToCheck) {
      const itemWidth = getItemWidth(item);
      const gapBefore = visible.length > 0 ? gap : 0;

      if (currentWidth + gapBefore + itemWidth <= availableWidth) {
        visible.push(item);
        currentWidth += gapBefore + itemWidth;
      } else {
        hidden.push(item);
      }
    }

    return { visible, hidden };
  };

  /**
   * Calculate which elements will be visible and which will be hidden.
   *
   * Uses a two-pass approach:
   * 1st pass: calculate assuming no "more" button
   * 2nd pass (if overflow): recalculate with "more" button width reserved
   */
  const calculateVisibleItems = () => {
    if (!containerRef.value || !items.value.length) return;

    // When container has no width yet, show all items so the container gains
    // intrinsic size. ResizeObserver will trigger a recalculation once it does.
    if (containerWidth.value <= 0) {
      visibleItems.value = [...items.value];
      hiddenItems.value = [];
      return;
    }

    // Always read fresh gap (may change with responsive breakpoints)
    containerGap.value = readContainerGap(containerRef.value);
    const gap = containerGap.value;
    const itemsToCheck = calculationStrategy === "reverse" ? [...items.value].reverse() : items.value;

    // 1st pass: full container width (no "more" button)
    let result = distributeItems(itemsToCheck, containerWidth.value);

    // 2nd pass: if items overflowed, recalculate with "more" button space reserved
    // Also account for the gap before/after the "more" button
    if (result.hidden.length > 0) {
      const effectiveMoreWidth = getMoreButtonWidth();
      const gapBeforeMore = result.visible.length > 0 ? gap : 0;
      result = distributeItems(itemsToCheck, containerWidth.value - effectiveMoreWidth - gapBeforeMore);
    }

    // Restore original order for reverse strategy
    if (calculationStrategy === "reverse") {
      visibleItems.value = result.visible.reverse();
      hiddenItems.value = result.hidden.reverse();
    } else {
      visibleItems.value = result.visible;
      hiddenItems.value = result.hidden;
    }
  };

  /**
   * Measure natural widths of all rendered items and update the cache.
   * Also measures the "more" button if it's in the DOM.
   */
  const measureElementSizes = () => {
    if (!containerRef.value) return;

    // Update container gap
    containerGap.value = readContainerGap(containerRef.value);

    // Measure the "more" button if present
    measureMoreButton();

    const elements = containerRef.value.querySelectorAll("[data-item-key]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-item-key");
      if (key) {
        const width = measureNaturalWidth(element as HTMLElement);
        if (width > 0) {
          itemSizes.value.set(key, width);
        }
      }
    });

    calculateVisibleItems();
  };

  /**
   * Remove stale entries from the size cache when items are removed.
   */
  const cleanupSizeCache = () => {
    const currentKeys = new Set(items.value.map(getItemKey));
    for (const key of itemSizes.value.keys()) {
      if (!currentKeys.has(key)) {
        itemSizes.value.delete(key);
      }
    }
  };

  /**
   * Setup ResizeObserver: observe current elements, unobserve removed ones.
   * Uses a single persistent observer instance.
   */
  const setupElementsObserver = () => {
    // Create observer lazily on first call
    if (!elementsObserver) {
      elementsObserver = new ResizeObserver((entries) => {
        // Avoid DOM mutations inside ResizeObserver callback to prevent re-entry loops.
        // Visible items should already be at natural width after calculateVisibleItems,
        // so reading offsetWidth directly is safe here.
        let hasChanges = false;

        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (!element.isConnected) continue;

          const key = element.getAttribute("data-item-key");
          if (!key) continue;

          // Use borderBoxSize from the entry when available (avoids forced reflow),
          // otherwise fall back to offsetWidth + margins.
          const styles = getComputedStyle(element);
          const borderBoxWidth = entry.borderBoxSize?.[0]?.inlineSize;
          const baseWidth = borderBoxWidth != null ? borderBoxWidth : element.offsetWidth;
          const width =
            baseWidth + parseFloat(styles.marginLeft || "0") + parseFloat(styles.marginRight || "0");

          if (width > 0 && itemSizes.value.get(key) !== width) {
            itemSizes.value.set(key, width);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          calculateVisibleItems();
        }
      });
    }

    nextTick(() => {
      if (!containerRef.value) return;

      const elements = containerRef.value.querySelectorAll("[data-item-key]");
      const newElements = new Set<Element>();

      // Observe new elements
      elements.forEach((element) => {
        newElements.add(element);
        if (!observedElements.has(element)) {
          elementsObserver?.observe(element);
          observedElements.add(element);
        }
      });

      // Unobserve removed elements
      for (const element of observedElements) {
        if (!newElements.has(element)) {
          elementsObserver?.unobserve(element);
          observedElements.delete(element);
        }
      }

      // Measure all current elements
      measureElementSizes();
    });
  };

  // Debounced recalculation for container width changes (avoid per-pixel recalcs during animation)
  const debouncedCalculate = useDebounceFn(() => {
    // Re-read gap in case container layout changed
    if (containerRef.value) {
      containerGap.value = readContainerGap(containerRef.value);
    }
    calculateVisibleItems();
  }, 50);

  // Recalculate when container width changes
  watch(containerWidth, () => {
    debouncedCalculate();
  });

  // When "more" button appears/disappears, measure it on the next tick
  watch(showMoreButton, (visible) => {
    if (visible) {
      nextTick(() => {
        const prevWidth = measuredMoreWidth.value;
        measureMoreButton();
        // If measured width differs from what we used, recalculate
        if (measuredMoreWidth.value !== null && measuredMoreWidth.value !== prevWidth) {
          calculateVisibleItems();
        }
      });
    }
  });

  // Shallow watch: react to item count / identity changes, not deep property changes
  watch(
    () => items.value.map(getItemKey).join("\0"),
    () => {
      cleanupSizeCache();
      nextTick(() => {
        setupElementsObserver();
      });
    },
  );

  // Initialize when mounted
  onMounted(() => {
    nextTick(() => {
      measureElementSizes();
      setupElementsObserver();
    });
  });

  // Cleanup resources when unmounted
  onBeforeUnmount(() => {
    if (elementsObserver) {
      elementsObserver.disconnect();
      elementsObserver = null;
    }
    observedElements.clear();
  });

  return {
    visibleItems,
    hiddenItems,
    showMoreButton,
    recalculate: () => {
      nextTick(() => {
        measureElementSizes();
      });
    },
    // Export function for updating observer
    updateObserver: setupElementsObserver,
  };
}
