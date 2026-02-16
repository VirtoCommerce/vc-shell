import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref, type ComputedRef } from "vue";

export interface VirtualScrollOptions<T> {
  /** The items array to virtualize */
  items: Ref<T[]> | ComputedRef<T[]>;
  /** Height of each row in pixels (required for virtualization) */
  itemSize: number;
  /** Reference to the scroll container element */
  containerRef: Ref<HTMLElement | null>;
  /** Number of buffer items above/below viewport (default: 5) */
  numToleratedItems?: number;
  /** Debounce delay for scroll events in ms (default: 0) */
  delay?: number;
  /** Enable lazy loading mode */
  lazy?: boolean;
  /** Callback when virtual scroll position changes */
  onScroll?: (event: { first: number; last: number }) => void;
  /** Callback for lazy loading when new items need to be fetched */
  onLazyLoad?: (event: { first: number; last: number }) => void;
}

export interface VirtualScrollItem<T> {
  item: T;
  index: number;
}

export interface VirtualScrollReturn<T> {
  /** Currently visible items with their original indices */
  visibleItems: ComputedRef<VirtualScrollItem<T>[]>;
  /** Total height of the content in pixels */
  totalHeight: ComputedRef<number>;
  /** Offset Y for positioning visible rows */
  offsetY: ComputedRef<number>;
  /** Current visible range (start and end indices) */
  visibleRange: ComputedRef<{ start: number; end: number }>;
  /** Current scroll position */
  scrollTop: Ref<number>;
  /** Container height */
  containerHeight: Ref<number>;
  /** Handle scroll events */
  onScroll: (event: Event) => void;
  /** Whether virtual scroll is currently loading (for lazy mode) */
  isLoading: Ref<boolean>;
  /** Scroll to a specific index */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  /** Scroll to top */
  scrollToTop: (behavior?: ScrollBehavior) => void;
  /** Scroll to bottom */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * Composable for virtual scrolling / windowing of large lists
 *
 * Virtual scrolling renders only the visible items plus a buffer,
 * dramatically improving performance for large datasets.
 *
 * @example
 * ```ts
 * const items = ref(generateLargeDataset(10000));
 * const containerRef = ref<HTMLElement | null>(null);
 *
 * const {
 *   visibleItems,
 *   totalHeight,
 *   offsetY,
 *   onScroll,
 * } = useVirtualScroll({
 *   items,
 *   itemSize: 48, // row height in pixels
 *   containerRef,
 *   numToleratedItems: 5,
 * });
 * ```
 */
export function useVirtualScroll<T>(options: VirtualScrollOptions<T>): VirtualScrollReturn<T> {
  const {
    items,
    itemSize,
    containerRef,
    numToleratedItems = 5,
    delay = 0,
    lazy = false,
    onScroll: onScrollCallback,
    onLazyLoad,
  } = options;

  // Internal state
  const scrollTop = ref(0);
  const containerHeight = ref(0);
  const isLoading = ref(false);
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastLazyLoadRange = { start: -1, end: -1 };

  /**
   * Calculate the visible range of items based on scroll position
   */
  const visibleRange = computed(() => {
    const buffer = numToleratedItems;
    const itemCount = items.value.length;

    if (itemCount === 0 || containerHeight.value === 0) {
      return { start: 0, end: 0 };
    }

    // Calculate start index (first visible item minus buffer)
    const firstVisibleIndex = Math.floor(scrollTop.value / itemSize);
    const start = Math.max(0, firstVisibleIndex - buffer);

    // Calculate how many items fit in the viewport
    const visibleCount = Math.ceil(containerHeight.value / itemSize);

    // Calculate end index (last visible item plus buffer)
    const end = Math.min(itemCount, firstVisibleIndex + visibleCount + buffer * 2);

    return { start, end };
  });

  /**
   * Get the visible items with their original indices
   */
  const visibleItems = computed<VirtualScrollItem<T>[]>(() => {
    const { start, end } = visibleRange.value;
    const itemsArray = items.value;

    return itemsArray.slice(start, end).map((item, localIndex) => ({
      item,
      index: start + localIndex,
    }));
  });

  /**
   * Calculate total height for the spacer element
   */
  const totalHeight = computed(() => {
    return items.value.length * itemSize;
  });

  /**
   * Calculate offset for positioning visible rows
   */
  const offsetY = computed(() => {
    return visibleRange.value.start * itemSize;
  });

  /**
   * Handle scroll events with optional debouncing
   */
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const updateScroll = () => {
      scrollTop.value = target.scrollTop;
      containerHeight.value = target.clientHeight;

      const range = visibleRange.value;

      // Emit scroll event callback
      if (onScrollCallback) {
        onScrollCallback({ first: range.start, last: range.end });
      }

      // Handle lazy loading
      if (lazy && onLazyLoad) {
        // Only trigger lazy load if range has changed significantly
        if (
          range.start !== lastLazyLoadRange.start ||
          range.end !== lastLazyLoadRange.end
        ) {
          lastLazyLoadRange = { ...range };
          isLoading.value = true;
          onLazyLoad({ first: range.start, last: range.end });
        }
      }
    };

    if (delay > 0) {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(updateScroll, delay);
    } else {
      updateScroll();
    }
  };

  /**
   * Scroll to a specific item index
   */
  const scrollToIndex = (index: number, behavior: ScrollBehavior = "auto") => {
    if (!containerRef.value) return;

    const targetScrollTop = index * itemSize;
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior,
    });
  };

  /**
   * Scroll to the top of the list
   */
  const scrollToTop = (behavior: ScrollBehavior = "auto") => {
    if (!containerRef.value) return;
    containerRef.value.scrollTo({ top: 0, behavior });
  };

  /**
   * Scroll to the bottom of the list
   */
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (!containerRef.value) return;
    const maxScroll = totalHeight.value - containerHeight.value;
    containerRef.value.scrollTo({ top: Math.max(0, maxScroll), behavior });
  };

  /**
   * Initialize container dimensions on mount
   */
  const initializeContainer = () => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight;
      scrollTop.value = containerRef.value.scrollTop;
    }
  };

  /**
   * Handle window resize to update container height
   */
  const handleResize = () => {
    initializeContainer();
  };

  // Watch for container ref changes
  watch(
    containerRef,
    (newRef) => {
      if (newRef) {
        initializeContainer();
      }
    },
    { immediate: true }
  );

  // Watch for items changes - reset scroll if items change significantly
  watch(
    () => items.value.length,
    (newLength, oldLength) => {
      // If items array is replaced entirely (e.g., new search results)
      // we might want to scroll to top
      if (oldLength > 0 && newLength !== oldLength) {
        // Reset lazy load tracking
        lastLazyLoadRange = { start: -1, end: -1 };
      }
    }
  );

  // Setup resize observer
  onMounted(() => {
    initializeContainer();
    window.addEventListener("resize", handleResize);
  });

  // Cleanup
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
    scrollTop,
    containerHeight,
    onScroll: handleScroll,
    isLoading,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}
