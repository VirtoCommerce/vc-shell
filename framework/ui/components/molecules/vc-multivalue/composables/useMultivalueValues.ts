import { computed, type ComputedRef } from "vue";
import type { MultivalueType } from "@ui/components/molecules/vc-multivalue/composables/useMultivalueMode";

interface UseMultivalueValuesOptions<T> {
  modelValue: () => T[];
  optionLabel: () => string;
  type: () => MultivalueType;
  emit: {
    updateModelValue: (val: T[]) => void;
  };
}

/**
 * Manages the value list: formatting display values, adding, removing, and clearing items.
 */
export function useMultivalueValues<T>(options: UseMultivalueValuesOptions<T>) {
  const formatValue: ComputedRef<(item: T) => string | number | T[keyof T]> = computed(() => {
    return (item: T) => {
      const label = item[options.optionLabel() as keyof T];
      const t = options.type();
      if (t === "number") {
        return Number(label).toFixed(3);
      } else if (t === "integer") {
        return Math.trunc(+label);
      }
      return label;
    };
  });

  function removeAtIndex(index: number) {
    const result = [...options.modelValue()];
    result.splice(index, 1);
    options.emit.updateModelValue(result);
  }

  function clearAll() {
    options.emit.updateModelValue([]);
  }

  function addItem(item: T) {
    options.emit.updateModelValue([...options.modelValue(), item]);
  }

  return {
    formatValue,
    removeAtIndex,
    clearAll,
    addItem,
  };
}
