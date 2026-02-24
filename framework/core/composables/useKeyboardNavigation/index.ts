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
   * Validate and reset focused index if it's out of bounds
   */
  const validateFocusedIndex = (elements: HTMLElement[]) => {
    if (focusedItemIndex.value >= elements.length || focusedItemIndex.value < 0) {
      focusedItemIndex.value = elements.length > 0 ? 0 : -1;
    }
  };

  /**
   * Handler for keydown events for navigation
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!container.value) return;

    const focusableElements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];

    if (!focusableElements.length) return;

    // Validate focused index before processing any navigation
    validateFocusedIndex(focusableElements);

    switch (event.key) {
      case "Tab":
        // Standard tabulation between elements
        handleTabNavigation(event, focusableElements);
        break;
      case "ArrowDown":
        // Navigation forward
        event.preventDefault();
        focusNextElement(focusableElements);
        break;
      case "ArrowUp":
        // Navigation backward
        event.preventDefault();
        focusPreviousElement(focusableElements);
        break;
      case "Enter":
      case " ":
        // Selection of the current element
        if (focusedItemIndex.value >= 0 && focusedItemIndex.value < focusableElements.length) {
          const currentElement = focusableElements[focusedItemIndex.value];
          if (currentElement) {
            event.preventDefault();
            if (onEnter) {
              onEnter(currentElement);
            } else if (typeof currentElement.click === "function") {
              currentElement.click();
            }
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

    validateFocusedIndex(elements);

    if (focusedItemIndex.value < elements.length - 1) {
      focusedItemIndex.value++;
    } else if (loop) {
      focusedItemIndex.value = 0;
    } else {
      // If loop is false and we're at the last element, stay at the last element
      return;
    }

    const elementToFocus = elements[focusedItemIndex.value];
    if (elementToFocus && typeof elementToFocus.focus === "function") {
      elementToFocus.focus();
    }
  };

  /**
   * Focus on the previous element
   */
  const focusPreviousElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;

    validateFocusedIndex(elements);

    if (focusedItemIndex.value > 0) {
      focusedItemIndex.value--;
    } else if (loop) {
      focusedItemIndex.value = elements.length - 1;
    } else {
      // If loop is false and we're at the first element, stay at the first element
      return;
    }

    const elementToFocus = elements[focusedItemIndex.value];
    if (elementToFocus && typeof elementToFocus.focus === "function") {
      elementToFocus.focus();
    }
  };

  /**
   * Focus on the first element
   */
  const focusFirstElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;
    focusedItemIndex.value = 0;
    const elementToFocus = elements[0];
    if (elementToFocus && typeof elementToFocus.focus === "function") {
      elementToFocus.focus();
    }
  };

  /**
   * Focus on the last element
   */
  const focusLastElement = (elements: HTMLElement[]) => {
    if (!elements.length) return;
    focusedItemIndex.value = elements.length - 1;
    const elementToFocus = elements[elements.length - 1];
    if (elementToFocus && typeof elementToFocus.focus === "function") {
      elementToFocus.focus();
    }
  };

  /**
   * Initialization and event processing
   */
  const initKeyboardNavigation = (el: HTMLElement) => {
    // Clean up previous listener to avoid double-registration
    // (onMounted may have auto-attached to a global containerSelector match)
    if (container.value) {
      container.value.removeEventListener("keydown", handleKeyDown);
    }
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
      if (container.value) {
        const elements = Array.from(container.value.querySelectorAll(itemSelector)) as HTMLElement[];
        if (index >= 0 && index < elements.length) {
          focusedItemIndex.value = index;
        }
      }
    },
    getFocusedIndex: () => focusedItemIndex.value,
  };
}
