import { ref } from "vue";

/**
 * Composible for managing a widget clone during dragging
 *
 * Provides functions for creating, updating, and deleting a widget clone
 * during dragging, as well as for animating the transition
 *
 * @returns An object with functions for working with the widget clone
 */
export function useDragClone() {
  // Reference to the DOM element of the clone
  const dragClone = ref<HTMLElement | null>(null);

  /**
   * Creates a widget clone for dragging
   *
   * @param element The HTML element from which dragging starts
   * @returns The DOM element of the clone or null if the clone was not created
   */
  const createDragClone = (element: HTMLElement) => {
    // Find the parent widget element
    const widgetElement = element.closest(".dashboard-widget") as HTMLElement;
    if (!widgetElement) return null;

    const clone = widgetElement.cloneNode(true) as HTMLElement;
    const rect = widgetElement.getBoundingClientRect();

    // Consider the page scroll
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Copy all computed styles from the original
    const computedStyle = window.getComputedStyle(widgetElement);

    clone.style.position = "fixed";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.left = `${rect.left + scrollX}px`;
    clone.style.top = `${rect.top + scrollY}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "0.95";
    clone.style.transform = "scale(1.02)";
    clone.style.transition = "transform 0.1s ease, opacity 0.2s ease";
    clone.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    clone.style.willChange = "transform";

    // Copy important styles from the original
    clone.style.backgroundColor = computedStyle.backgroundColor;
    clone.style.borderRadius = computedStyle.borderRadius;

    // Add a class for styling the clone
    clone.classList.add("dashboard-widget-clone");

    // Animation of appearance
    requestAnimationFrame(() => {
      clone.style.transform = "scale(1.02)";
      clone.style.opacity = "0.92";
    });

    document.body.appendChild(clone);
    dragClone.value = clone;
    return clone;
  };

  /**
   * Updates the position of the clone during dragging
   *
   * @param deltaX The offset along the X axis
   * @param deltaY The offset along the Y axis
   */
  const updateDragClonePosition = (deltaX: number, deltaY: number) => {
    if (!dragClone.value) return;

    dragClone.value.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  };

  /**
   * Removes the widget clone
   */
  const removeDragClone = () => {
    if (!dragClone.value) return;

    if (dragClone.value.parentNode) {
      document.body.removeChild(dragClone.value);
    }
    dragClone.value = null;
  };

  return {
    dragClone,
    createDragClone,
    updateDragClonePosition,
    removeDragClone,
  };
}
