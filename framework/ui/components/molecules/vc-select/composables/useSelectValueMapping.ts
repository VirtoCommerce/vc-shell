import { computed, ComputedRef } from "vue";
import { isEqual } from "lodash-es";

export type OptionProp<T> = ((option: T) => string) | string | undefined;

interface UseSelectValueMappingOptions<Option> {
  optionValue: () => OptionProp<Option>;
  optionLabel: () => OptionProp<Option>;
}

function getPropValueFn<Option>(propValue: OptionProp<Option>, defaultVal: OptionProp<Option>) {
  const val = propValue !== undefined ? propValue : defaultVal;

  if (typeof val === "function") {
    return val;
  } else {
    return (opt: Option) => {
      // Support for primitive types (string, number, etc.)
      if (opt === null || typeof opt !== "object") {
        return opt;
      }

      if (val && val in (opt as Record<string, unknown>)) {
        return (opt as Record<string, unknown>)[val];
      } else {
        return opt;
      }
    };
  }
}

export function useSelectValueMapping<Option>(options: UseSelectValueMappingOptions<Option>) {
  const getOptionValue = computed(() => getPropValueFn(options.optionValue(), "id")) as ComputedRef<(opt: Option) => any>;

  const getOptionLabel = computed(() => getPropValueFn(options.optionLabel(), "title")) as ComputedRef<(opt: Option) => any>;

  function getOption(value: Option, valueCache: Option[], defaultValues: Option[], optionsList: Option[]) {
    const fn = (opt: Option) => isEqual(getOptionValue.value(opt), value);
    return defaultValues.find(fn) || optionsList.find(fn) || valueCache.find(fn) || value;
  }

  function getEmittingOptionValue(opt: Option) {
    return getOptionLabel.value(opt);
  }

  function fieldValueIsFilled(val: Option[]) {
    return val !== undefined && val !== null && ("" + val).length > 0;
  }

  return {
    getOptionValue,
    getOptionLabel,
    getOption,
    getEmittingOptionValue,
    fieldValueIsFilled,
  };
}
