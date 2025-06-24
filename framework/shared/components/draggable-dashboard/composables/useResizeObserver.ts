import { ref, onUnmounted } from "vue";

/**
 * Hook for managing ResizeObserver
 *
 * Provides functionality for tracking changes in the sizes of elements
 *
 * @param callback The function called when the sizes change
 * @param options Options
 * @returns An object with methods for working with ResizeObserver
 */
export function useResizeObserver(
  callback: (entries: ResizeObserverEntry[]) => void,
  options?: {
    debounceMs?: number;
  },
) {
  // Instance of ResizeObserver
  const observer = ref<ResizeObserver | null>(null);

  // Timer identifier for debounce
  const debounceTimer = ref<number | null>(null);

  // Determine if the browser supports ResizeObserver
  const isSupported = typeof window !== "undefined" && "ResizeObserver" in window;

  /**
   * The handler of the event of changing the sizes with debounce
   *
   * @param entries The array of ResizeObserverEntry
   */
  const handleResize = (entries: ResizeObserverEntry[]) => {
    if (options?.debounceMs) {
      // Clear the previous timer if it exists
      if (debounceTimer.value !== null) {
        window.clearTimeout(debounceTimer.value);
        debounceTimer.value = null;
      }

      // Set a new timer
      debounceTimer.value = window.setTimeout(() => {
        callback(entries);
      }, options.debounceMs);
    } else {
      // Call immediately without debounce
      callback(entries);
    }
  };

  /**
   * Initializes ResizeObserver for the specified element
   *
   * @param element The element to monitor the sizes
   */
  const observe = (element: Element) => {
    if (!isSupported) return;

    // Create a new ResizeObserver if it doesn't exist
    if (!observer.value) {
      observer.value = new ResizeObserver(handleResize);
    }

    // Start monitoring the changes in the sizes
    observer.value.observe(element);
  };

  /**
   * Stops monitoring the changes in the sizes for the specified element
   *
   * @param element The element for which to stop monitoring
   */
  const unobserve = (element: Element) => {
    if (!isSupported || !observer.value) return;

    observer.value.unobserve(element);
  };

  /**
   * Disconnects ResizeObserver and clears all resources
   */
  const disconnect = () => {
    if (!isSupported || !observer.value) return;

    observer.value.disconnect();
    observer.value = null;

    // Clear the debounce timer
    if (debounceTimer.value !== null) {
      window.clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
  };

  // Automatic cleanup when the component is unmounted
  onUnmounted(() => {
    disconnect();
  });

  return {
    observe,
    unobserve,
    disconnect,
    isSupported,
  };
}
