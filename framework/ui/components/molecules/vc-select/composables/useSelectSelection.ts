import { computed, watch, Ref, ComputedRef } from "vue";
import { isEqual } from "lodash-es";

interface UseSelectSelectionOptions<Option> {
  modelValue: () => any;
  multiple: () => boolean | undefined;
  emitValue: () => boolean;
  mapOptions: () => boolean;
  optionsList: Ref<Option[]>;
  defaultValue: Ref<Option[]>;
  getOptionValue: ComputedRef<(opt: Option) => any>;
  getOptionLabel: ComputedRef<(opt: Option) => any>;
  getOption: (value: Option, valueCache: Option[], defaultValues: Option[], optionsList: Option[]) => Option;
  fieldValueIsFilled: (val: Option[]) => boolean;
  isOpened: Ref<boolean>;
  popperUpdate: () => void;
  emit: {
    updateModelValue: (val: any) => void;
    close: () => void;
  };
}

export function useSelectSelection<Option>(opts: UseSelectSelectionOptions<Option>) {
  let innerValueCache: Option[] = [];

  const innerValue = computed((): Option[] => {
    const mapNull = opts.mapOptions() === true && opts.multiple() !== true;

    const val =
      opts.modelValue() !== undefined && (opts.modelValue() !== null || mapNull === true)
        ? opts.multiple() === true && Array.isArray(opts.modelValue())
          ? opts.modelValue()
          : [opts.modelValue()]
        : [];

    if (opts.mapOptions() === true && Array.isArray(opts.optionsList.value) === true) {
      const cache = opts.mapOptions() === true && innerValueCache !== undefined ? innerValueCache : [];

      const values = val.map((v: Option) =>
        opts.getOption(v, cache, opts.defaultValue.value, opts.optionsList.value),
      );

      return opts.modelValue() === null && mapNull === true ? values.filter((v: Option) => v !== null) : values;
    }

    return val;
  });

  watch(
    innerValue,
    (val) => {
      innerValueCache = val;
    },
    { immediate: true },
  );

  const innerOptionsValue = computed(() => innerValue.value.map((opt) => opts.getOptionValue.value(opt)));

  function isOptionSelected(opt: Option) {
    const val = opts.getOptionValue.value(opt);
    return innerOptionsValue.value.find((v) => isEqual(v, val)) !== void 0;
  }

  const selectedScope = computed(
    (): {
      index: number;
      opt: Option;
      selected: boolean;
      toggleOption: (opt: Option) => void;
      removeAtIndex: (index: number) => void;
    }[] => {
      return innerValue.value.map((opt: Option, i: number) => ({
        index: i,
        opt,
        selected: true,
        toggleOption,
        removeAtIndex,
      }));
    },
  );

  const hasValue = computed(() => opts.fieldValueIsFilled(innerValue.value));

  const optionScope = computed(() => {
    return opts.optionsList.value.map((opt, i) => {
      return {
        index: i,
        opt,
        selected: isOptionSelected(opt) === true,
        label: opts.getOptionLabel.value(opt),
        toggleOption,
      };
    });
  });

  function toggleOption(opt: Option) {
    if (opt === void 0) {
      return;
    }

    const optValue = opts.getOptionValue.value(opt) as Option[];

    if (opts.multiple() !== true) {
      if (
        innerValue.value.length === 0 ||
        isEqual(opts.getOptionValue.value(innerValue.value[0]), optValue) !== true
      ) {
        opts.emit.updateModelValue(opts.emitValue() === true ? optValue : opt);
      }

      opts.isOpened.value = false;
      opts.emit.close();
      return;
    }

    if (innerValue.value.length === 0) {
      const val = opts.emitValue() === true ? optValue : opt;
      opts.emit.updateModelValue(opts.multiple() === true ? ([val] as Option[]) : (val as Option));
      return;
    }

    const model = opts.modelValue().slice();
    const index = innerOptionsValue.value.findIndex((v) => isEqual(v, optValue));

    if (index > -1) {
      model.splice(index, 1);
    } else {
      const val = opts.emitValue() === true ? optValue : opt;
      model.push(val);
    }

    opts.emit.updateModelValue(model);

    if (opts.isOpened.value) {
      opts.popperUpdate();
    }
  }

  function removeAtIndex(index: number) {
    if (index > -1 && index < innerValue.value.length) {
      if (opts.multiple() === true) {
        const model = opts.modelValue().slice();
        model.splice(index, 1);
        opts.emit.updateModelValue(model);
      } else {
        opts.emit.updateModelValue(null);
      }
    }
  }

  function onReset() {
    if (opts.multiple()) {
      opts.emit.updateModelValue([]);
      return;
    }
    opts.emit.updateModelValue(null);
  }

  return {
    innerValue,
    selectedScope,
    hasValue,
    innerOptionsValue,
    optionScope,
    toggleOption,
    removeAtIndex,
    isOptionSelected,
    onReset,
  };
}
