import { computed, type Ref } from "vue";

interface UseMultivalueOptionsOptions<T> {
  options: () => T[];
  modelValue: () => T[];
  optionValue: () => string;
}

/**
 * Filters available options by excluding already-selected items.
 * In dictionary mode, only unselected options appear in the dropdown.
 */
export function useMultivalueOptions<T>(options: UseMultivalueOptionsOptions<T>) {
  const availableOptions = computed(() => {
    const currentOptions = options.options();
    const currentValue = options.modelValue();
    const valueKey = options.optionValue() as keyof T;

    return currentOptions.filter((opt) => {
      return !currentValue.find((selected) => selected[valueKey] === opt[valueKey]);
    });
  });

  return {
    availableOptions,
  };
}
