import { ref, watch, Ref, computed, DeepReadonly, unref, isRef } from "vue";
import { cloneDeep, isEqualWith } from "lodash-es";

/**
 * Custom comparator for deep equality that treats null, undefined, and ""
 * as semantically equivalent "empty" values.
 * This prevents false modification detection when APIs return null
 * but local state uses undefined or empty strings (common with language switching).
 */
function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function semanticEqual(a: unknown, b: unknown): boolean {
  return isEqualWith(a, b, (valA: unknown, valB: unknown) => {
    if (isEmpty(valA) && isEmpty(valB)) return true;
    return undefined; // fall back to default deep comparison
  });
}

/**
 * Return values from useModificationTracker.
 * @template T Type of the tracked value.
 */
export interface UseModificationTrackerReturn<T> {
  /**
   * Reactive reference to the current tracked value.
   * It can be changed directly or through v-model.
   */
  currentValue: Ref<T>;
  /**
   * Reactive reference to the pristine value.
   * It is a "clean" version representing the original, unmodified state.
   */
  pristineValue: Ref<T>;
  /**
   * Shows if currentValue has been modified compared to its "pristine" state.
   * Read-only.
   */
  isModified: DeepReadonly<Ref<boolean>>;
  /**
   * Resets the modification state.
   * The new "pristine" state will be set based on the current value of currentValue,
   * or based on `newBaselineValue` if provided.
   * `isModified` will become false.
   * @param newBaselineValue Optional new value (or Ref) that will become "pristine".
   */
  resetModificationState: (newBaselineValue?: T | Ref<T>) => void;
}

/**
 * Composable for tracking value changes (including deeply nested objects).
 *
 * @template T Type of the tracked value.
 * @param initialValueProp Initial value or Ref to it.
 * @returns {UseModificationTrackerReturn<T>} Object with `currentValue`, `isModified` and `resetModificationState`.
 */
export function useModificationTracker<T>(initialValueProp: T | Ref<T>): UseModificationTrackerReturn<T> {
  const getClonedUnreffedValue = (val: T | Ref<T>): T => cloneDeep(unref(val));

  const pristineValue = ref(getClonedUnreffedValue(initialValueProp)) as Ref<T>;
  const currentValue = ref(getClonedUnreffedValue(initialValueProp)) as Ref<T>;
  const isModified = ref(false);

  if (isRef(initialValueProp)) {
    watch(
      initialValueProp,
      (newExternalInitialValue) => {
        // When the external initialValueProp (Ref) changes,
        // we need to decide if we should update currentValue.
        const wasModified = !semanticEqual(currentValue.value, pristineValue.value);

        // Always update the "pristine" value (pristineValue), to reflect the new external source.
        pristineValue.value = cloneDeep(newExternalInitialValue);

        // If the user has not made any changes until this point,
        // we also update currentValue.
        // This prevents false triggering of isModified when loading data asynchronously.
        if (!wasModified) {
          currentValue.value = cloneDeep(newExternalInitialValue);
        }
        // If the user has already made changes (wasModified = true), we do not update currentValue,
        // to not overwrite their changes. isModified will remain true, because
        // currentValue will now be different from the new pristineValue.
      },
      { deep: true }, // Deep tracking, if initialValueProp is a Ref to an object/array
    );
  }

  watch(
    [currentValue, pristineValue], // Track changes in currentValue or pristineValue
    ([newCurrentVal, newPristineVal]) => {
      isModified.value = !semanticEqual(newCurrentVal, newPristineVal);
    },
    { deep: true },
  );

  const resetModificationState = (newBaselineValueInput?: T | Ref<T>) => {
    if (newBaselineValueInput !== undefined) {
      const newClonedBase = getClonedUnreffedValue(newBaselineValueInput);
      pristineValue.value = newClonedBase;
      currentValue.value = cloneDeep(newClonedBase); // Reset currentValue to the new baseline
    } else {
      pristineValue.value = cloneDeep(currentValue.value);
    }
    // Synchronously reset so that code running in the same tick (e.g. onBeforeClose)
    // sees the updated value before the deep watcher fires.
    isModified.value = false;
  };

  return {
    currentValue,
    pristineValue,
    isModified: computed(() => isModified.value),
    resetModificationState,
  };
}
