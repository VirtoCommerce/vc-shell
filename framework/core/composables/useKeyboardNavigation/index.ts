import { onMounted, onBeforeUnmount, ref } from "vue";

interface UseKeyboardNavigationOptions {
  containerSelector?: string;
  itemSelector?: string;
  onEnter?: (element: HTMLElement) => void;
  onEscape?: () => void;
  loop?: boolean;
}

/**
 * Hook for implementing standard keyboard navigation inside components
 * @param options Options for configuring navigation
 * @returns Object with methods for managing focus
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    containerSelector = '[role="menu"]',
    itemSelector = '[tabindex="0"]',
    onEnter,
    onEscape,
    loop = true,
  } = options;

  const container = ref<HTMLElement | null>(null);
  const focusedItemIndex = ref(-1);

  /**
   * Handler for keydown events for navigation
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!container.value) return;

    const focusableElements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];

    if (!focusableElements.length) return;

    switch (event.key) {
      case "Tab":
        // Standard tabulation between elements
        handleTabNavigation(event, focusableElements);
        break;
      case "ArrowDown":
      case "ArrowRight":
        // Navigation forward
        event.preventDefault();
        focusNextElement(focusableElements);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        // Navigation backward
        event.preventDefault();
        focusPreviousElement(focusableElements);
        break;
      case "Enter":
      case " ":
        // Selection of the current element
        if (focusedItemIndex.value >= 0 && focusedItemIndex.value < focusableElements.length) {
          event.preventDefault();
          if (onEnter) {
            onEnter(focusableElements[focusedItemIndex.value]);
          } else {
            focusableElements[focusedItemIndex.value].click();
          }
        }
        break;
      case "Escape":
        // Closing the menu or cancellation
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case "Home":
        // Transition to the first element
        event.preventDefault();
        focusFirstElement(focusableElements);
        break;
      case "End":
        // Transition to the last element
        event.preventDefault();
        focusLastElement(focusableElements);
        break;
    }
  };

  /**
   * Handling standard tabulation
   */
  const handleTabNavigation = (event: KeyboardEvent, elements: HTMLElement[]) => {
    if (event.shiftKey) {
      // Shift+Tab - backward
      focusPreviousElement(elements);
    } else {
      // Tab - forward
      focusNextElement(elements);
    }
  };

  /**
   * Focus on the next element
   */
  const focusNextElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;

    if (focusedItemIndex.value < elements.length - 1) {
      focusedItemIndex.value++;
    } else if (loop) {
      focusedItemIndex.value = 0;
    }

    elements[focusedItemIndex.value].focus();
  };

  /**
   * Focus on the previous element
   */
  const focusPreviousElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;

    if (focusedItemIndex.value > 0) {
      focusedItemIndex.value--;
    } else if (loop) {
      focusedItemIndex.value = elements.length - 1;
    }

    elements[focusedItemIndex.value].focus();
  };

  /**
   * Focus on the first element
   */
  const focusFirstElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;
    focusedItemIndex.value = 0;
    elements[0].focus();
  };

  /**
   * Focus on the last element
   */
  const focusLastElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;
    focusedItemIndex.value = elements.length - 1;
    elements[elements.length - 1].focus();
  };

  /**
   * Initialization and event processing
   */
  const initKeyboardNavigation = (el: HTMLElement) => {
    container.value = el;
    el.addEventListener("keydown", handleKeyDown);
  };

  /**
   * Cancelling event processing
   */
  const cleanupKeyboardNavigation = () => {
    if (container.value) {
      container.value.removeEventListener("keydown", handleKeyDown);
      container.value = null;
    }
  };

  onMounted(() => {
    if (typeof document !== "undefined" && containerSelector) {
      const el = document.querySelector(containerSelector) as HTMLElement;
      if (el) {
        initKeyboardNavigation(el);
      }
    }
  });

  onBeforeUnmount(() => {
    cleanupKeyboardNavigation();
  });

  return {
    initKeyboardNavigation,
    cleanupKeyboardNavigation,
    focusNextElement: () => {
      if (container.value) {
        const elements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];
        focusNextElement(elements);
      }
    },
    focusPreviousElement: () => {
      if (container.value) {
        const elements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];
        focusPreviousElement(elements);
      }
    },
    focusFirstElement: () => {
      if (container.value) {
        const elements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];
        focusFirstElement(elements);
      }
    },
    focusLastElement: () => {
      if (container.value) {
        const elements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];
        focusLastElement(elements);
      }
    },
    setFocusedIndex: (index: number) => {
      focusedItemIndex.value = index;
    },
    getFocusedIndex: () => focusedItemIndex.value,
  };
}
