import { ref, Ref, ComputedRef } from "vue";

interface UseSelectSearchOptions<Option> {
  debounce: () => number | string;
  options: () => ((...args: any[]) => Promise<any>) | any[];
  optionsList: Ref<Option[]>;
  optionsTemp: Ref<Option[]>;
  totalItems: Ref<number>;
  listLoading: Ref<boolean>;
  filterString: Ref<string | undefined>;
  getOptionLabel: ComputedRef<(opt: Option) => any>;
  emit: {
    search: (val: string) => void;
  };
}

export function useSelectSearch<Option>(opts: UseSelectSearchOptions<Option>) {
  const searchRef = ref<HTMLInputElement>();

  let emitValueFn: (() => void) | undefined;
  let emitTimer: ReturnType<typeof setTimeout>;

  async function onSearch(value: string) {
    opts.filterString.value = value;
    const optionsSource = opts.options();
    if (optionsSource && typeof optionsSource === "function") {
      try {
        opts.listLoading.value = true;

        const data = await optionsSource(opts.filterString.value);

        opts.optionsList.value = data?.results as Option[];
        opts.totalItems.value = data?.totalCount;
      } finally {
        opts.listLoading.value = false;
      }
    } else {
      opts.optionsList.value = opts.optionsTemp.value.filter((x: Option) => {
        const label = opts.getOptionLabel.value(x);
        return String(label).toLowerCase().includes(opts.filterString.value!.toLowerCase());
      });
    }
  }

  function onInput(e: Event) {
    if (!e || !e.target) {
      return;
    }

    const newValue = (e.target as HTMLInputElement).value;
    emitValueFunc(newValue);
  }

  function emitValueFunc(val: string) {
    emitValueFn = () => {
      opts.emit.search(val);
      onSearch(val);
      emitValueFn = undefined;
    };

    const debounce = opts.debounce();
    if (debounce !== undefined) {
      clearTimeout(emitTimer);
      emitTimer = setTimeout(emitValueFn, +debounce);
    } else {
      emitValueFn();
    }
  }

  function clearSearch() {
    if (searchRef.value) {
      searchRef.value.value = "";
    }
  }

  return {
    searchRef,
    onInput,
    onSearch,
    emitValueFunc,
    clearSearch,
  };
}
