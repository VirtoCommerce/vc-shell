import { ref } from "vue";

/**
 * Interface for event coordinates
 */
export interface EventCoordinates {
  clientX: number;
  clientY: number;
}

/**
 * Composible for processing event coordinates
 *
 * Provides functions for getting coordinates from different types of events,
 * tracking the initial position, and calculating the offset
 *
 * @returns An object with functions for working with event coordinates
 */
export function useEventCoordinates() {
  // Initial position of the mouse/touch
  const initialPosition = ref<EventCoordinates>({ clientX: 0, clientY: 0 });

  // Flag indicating whether the device is touch-enabled
  const isTouchDevice = ref(false);

  /**
   * Gets coordinates from a mouse or touch event
   *
   * @param event The mouse or touch event
   * @returns An object with coordinates clientX and clientY
   */
  const getEventCoordinates = (event: MouseEvent | TouchEvent): EventCoordinates => {
    if ("touches" in event) {
      // Touch event
      isTouchDevice.value = true;
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
      };
    }
    // Mouse event
    isTouchDevice.value = false;
    return {
      clientX: (event as MouseEvent).clientX,
      clientY: (event as MouseEvent).clientY,
    };
  };

  /**
   * Saves the initial position of the event
   *
   * @param event The mouse or touch event
   */
  const saveInitialPosition = (event: MouseEvent | TouchEvent) => {
    initialPosition.value = getEventCoordinates(event);
  };

  /**
   * Calculates the offset from the initial position
   *
   * @param currentCoordinates The current coordinates
   * @returns An object with the offsets along the X and Y axes
   */
  const calculateDelta = (currentCoordinates: EventCoordinates) => {
    return {
      deltaX: currentCoordinates.clientX - initialPosition.value.clientX,
      deltaY: currentCoordinates.clientY - initialPosition.value.clientY,
    };
  };

  /**
   * Checks if the offset from the initial position exceeds the specified threshold
   *
   * @param currentCoordinates The current coordinates
   * @param threshold The threshold of the offset in pixels
   * @returns true if the offset exceeds the threshold
   */
  const hasMovedBeyondThreshold = (currentCoordinates: EventCoordinates, threshold = 3) => {
    const { deltaX, deltaY } = calculateDelta(currentCoordinates);
    return Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold;
  };

  return {
    initialPosition,
    isTouchDevice,
    getEventCoordinates,
    saveInitialPosition,
    calculateDelta,
    hasMovedBeyondThreshold,
  };
}
