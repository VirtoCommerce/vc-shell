import { ref, computed, watch, Ref } from "vue";
import { unionBy } from "lodash-es";

interface UseSelectOptionsOptions<Option> {
  options: () => ((...args: any[]) => Promise<any>) | any[];
  filterString: Ref<string | undefined>;
  isOpened: Ref<boolean>;
  isSelectVisible: Ref<boolean>;
}

export function useSelectOptions<Option>(opts: UseSelectOptionsOptions<Option>) {
  const optionsList = ref<Option[]>([]) as Ref<Option[]>;
  const optionsTemp = ref<Option[]>([]) as Ref<Option[]>;
  const totalItems = ref<number>(0);
  const listLoading = ref(false);

  const hasNextPage = computed(() => {
    return optionsList.value.length < totalItems.value;
  });

  async function loadOptionsForOpenDropdown() {
    const optionsSource = opts.options();
    if (optionsSource && typeof optionsSource === "function" && !listLoading.value) {
      try {
        listLoading.value = true;
        const data = await optionsSource(opts.filterString.value, optionsList.value.length);
        if (opts.filterString.value || optionsList.value.length === 0) {
          optionsList.value = (data?.results as Option[]) || [];
        } else {
          optionsList.value = unionBy<Option>(optionsList.value, (data?.results as Option[]) || [], "id");
        }
        totalItems.value = data?.totalCount || 0;
        optionsTemp.value = optionsList.value;
      } catch (e) {
        console.error("Error in loadOptionsForOpenDropdown:", e);
        optionsList.value = [];
        totalItems.value = 0;
      } finally {
        listLoading.value = false;
      }
    }
  }

  async function onLoadMore() {
    const optionsSource = opts.options();
    if (optionsSource && typeof optionsSource === "function") {
      try {
        listLoading.value = true;
        const data = await optionsSource(opts.filterString.value, optionsList.value.length);
        optionsList.value = unionBy<Option>(optionsList.value, data?.results as Option[], "id");
        totalItems.value = data?.totalCount;
        optionsTemp.value = optionsList.value;
      } finally {
        listLoading.value = false;
      }
    }
  }

  const onDropdownClose = async () => {
    opts.filterString.value = undefined;

    if (opts.isSelectVisible.value) {
      const optionsSource = opts.options();
      if (optionsSource && typeof optionsSource === "function") {
        try {
          listLoading.value = true;
          const data = await optionsSource(undefined, 0);
          optionsList.value = (data?.results as Option[]) || [];
          totalItems.value = data?.totalCount || 0;
        } catch (e) {
          console.error("Error resetting optionsList on dropdown close:", e);
          optionsList.value = [];
          totalItems.value = 0;
        } finally {
          listLoading.value = false;
        }
      } else if (optionsSource && Array.isArray(optionsSource)) {
        optionsList.value = [...optionsSource] as Option[];
        totalItems.value = optionsList.value.length;
      }
    } else {
      const optionsSource = opts.options();
      if (optionsSource && typeof optionsSource === "function") {
        optionsList.value = [];
        totalItems.value = 0;
      }
    }

    optionsTemp.value = optionsList.value;
  };

  // Watch options prop changes
  watch(
    opts.options,
    async (newOptionsSource) => {
      optionsList.value = [];
      optionsTemp.value = [];
      totalItems.value = 0;

      if (opts.isSelectVisible.value) {
        if (Array.isArray(newOptionsSource)) {
          optionsList.value = [...newOptionsSource] as Option[];
          optionsTemp.value = optionsList.value;
          totalItems.value = optionsList.value.length;
        }

        if (opts.isOpened.value && typeof newOptionsSource === "function") {
          await loadOptionsForOpenDropdown();
        }
      }
    },
    { deep: false },
  );

  return {
    optionsList,
    optionsTemp,
    totalItems,
    listLoading,
    hasNextPage,
    loadOptionsForOpenDropdown,
    onLoadMore,
    onDropdownClose,
  };
}
