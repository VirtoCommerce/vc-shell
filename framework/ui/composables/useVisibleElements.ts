import { ref, Ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

export interface UseVisibleElementsOptions<T> {
  containerRef: Ref<HTMLElement | null>;
  items: Ref<T[]>;
  getItemId: (item: T) => string;
  maxVisibleItems?: number;
  moreButtonWidth?: number;
  reverseCalculation?: boolean;
  resizeContainer?: string[];
}

export function useVisibleElements<T>({
  containerRef,
  items,
  getItemId,
  maxVisibleItems,
  moreButtonWidth = 60,
  reverseCalculation = false,
  resizeContainer,
}: UseVisibleElementsOptions<T>) {
  const elementRefs = new Map<string, HTMLElement>();
  const displayedItems = ref<T[]>([]) as Ref<T[]>;
  const overflowItems = ref<T[]>([]) as Ref<T[]>;
  const showMoreButton = ref(false);

  const calculateVisibleElements = () => {
    if (!containerRef.value || !items.value.length) {
      displayedItems.value = items.value;
      overflowItems.value = [];
      showMoreButton.value = false;
      return;
    }

    const containerWidth = containerRef.value.clientWidth;
    const availableWidth = containerWidth - moreButtonWidth;
    let totalWidth = 0;
    let visibleCount = 0;

    for (const item of items.value) {
      const element = elementRefs.get(getItemId(item));
      if (!element) continue;

      const styles = getComputedStyle(element);
      const itemWidth = element.offsetWidth + parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);

      if (totalWidth + itemWidth <= availableWidth && (!maxVisibleItems || visibleCount < maxVisibleItems)) {
        totalWidth += itemWidth;
        visibleCount++;
      } else {
        break;
      }
    }

    if (reverseCalculation) {
      const start = items.value.length - visibleCount;
      displayedItems.value = items.value.slice(start);
      overflowItems.value = items.value.slice(0, start);
    } else {
      displayedItems.value = items.value.slice(0, visibleCount);
      overflowItems.value = items.value.slice(visibleCount);
    }
    showMoreButton.value = overflowItems.value.length > 0;
  };

  const setElementRef = (id: string, el: HTMLElement | Element | null) => {
    if (el) {
      elementRefs.set(id, el);
    } else {
      elementRefs.delete(id);
    }
  };

  watch(
    items,
    () => {
      nextTick(calculateVisibleElements);
    },
    { deep: true },
  );

  const setupResizeObserver = () => {
    let observer: ResizeObserver | null = null;

    const setupObserver = () => {
      if (!containerRef.value) return;

      if (observer) {
        observer.disconnect();
      }

      observer = new ResizeObserver(() => {
        requestAnimationFrame(calculateVisibleElements);
      });

      observer.observe(containerRef.value);

      if (resizeContainer) {
        resizeContainer.forEach((cls) => {
          const container = containerRef.value?.closest(cls);
          if (container) {
            observer?.observe(container);
          }
        });
      }
    };

    onMounted(() => {
      nextTick(() => {
        setupObserver();
        calculateVisibleElements();
      });
    });

    watch(containerRef, () => {
      nextTick(() => {
        setupObserver();
        calculateVisibleElements();
      });
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
    });
  };

  watch(items, () => {
    displayedItems.value = items.value;
    calculateVisibleElements();
  });

  return {
    setElementRef,
    displayedItems,
    overflowItems,
    showMoreButton,
    calculateVisibleElements,
    setupResizeObserver,
  };
}
