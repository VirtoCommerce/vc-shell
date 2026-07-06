import { reactive, ref } from "vue";

/**
 * Expand/collapse state machine + height tracking for the toast stack.
 * Extracted from NotificationContainer so the timer-driven behaviour can be
 * unit-tested with fake timers, leaving the component with only layout + render.
 */
export function useToastStack() {
  const expanded = ref(false);
  const interacting = ref(false);
  let collapseTimer: ReturnType<typeof setTimeout> | null = null;

  function expandStack() {
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      collapseTimer = null;
    }
    expanded.value = true;
  }

  function collapseStack() {
    if (interacting.value) return;
    collapseTimer = setTimeout(() => {
      expanded.value = false;
      collapseTimer = null;
    }, 200);
  }

  // Height tracking: toastId → height
  const heightsMap = reactive(new Map<string | number, number>());

  function reportHeight(toastId: string | number, height: number) {
    const rounded = Math.round(height);
    if (heightsMap.get(toastId) !== rounded) {
      heightsMap.set(toastId, rounded);
    }
  }

  function forgetHeight(toastId: string | number) {
    heightsMap.delete(toastId);
  }

  function clearHeights() {
    heightsMap.clear();
  }

  function setInteracting(value: boolean) {
    interacting.value = value;
  }

  return {
    expanded,
    interacting,
    heightsMap,
    expandStack,
    collapseStack,
    reportHeight,
    forgetHeight,
    clearHeights,
    setInteracting,
  };
}
