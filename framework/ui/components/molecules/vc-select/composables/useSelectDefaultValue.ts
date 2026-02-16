import { ref, watch, Ref, ComputedRef } from "vue";
import { isEqual } from "lodash-es";

interface UseSelectDefaultValueOptions<Option> {
  modelValue: Ref<any>;
  isSelectVisible: Ref<boolean>;
  emitValue: () => boolean;
  multiple: () => boolean | undefined;
  mapOptions: () => boolean;
  options: () => ((...args: any[]) => Promise<any>) | any[];
  getOptionValue: ComputedRef<(opt: Option) => any>;
}

export function useSelectDefaultValue<Option>(options: UseSelectDefaultValueOptions<Option>) {
  const defaultValue = ref<Option[]>([]) as Ref<Option[]>;
  const defaultOptionLoading = ref(false);

  watch(
    [() => options.modelValue.value, options.isSelectVisible],
    async ([currentModelVal, selectIsVisible]) => {
      let modelAsArrayValueIds: (string | number | Record<string, any> | null)[] = [];
      if (Array.isArray(currentModelVal)) {
        modelAsArrayValueIds = options.emitValue()
          ? currentModelVal
          : currentModelVal.map((v) => options.getOptionValue.value(v as Option));
      } else if (currentModelVal != null) {
        modelAsArrayValueIds = [
          options.emitValue() ? currentModelVal : options.getOptionValue.value(currentModelVal as Option),
        ];
      }

      const currentDefaultValueIds = defaultValue.value.map((opt) => options.getOptionValue.value(opt));

      const sortedCurrentDefaultIds = [...currentDefaultValueIds].sort((a, b) => String(a).localeCompare(String(b)));
      const sortedModelValueIds = [...modelAsArrayValueIds].sort((a, b) => String(a).localeCompare(String(b)));

      const isDefaultValueResolved =
        isEqual(sortedCurrentDefaultIds, sortedModelValueIds) &&
        (modelAsArrayValueIds.length > 0 || defaultValue.value.length === 0);

      if (!selectIsVisible) {
        if (modelAsArrayValueIds.length === 0 && defaultValue.value.length > 0) {
          defaultValue.value = [];
        }
        return;
      }

      if (modelAsArrayValueIds.length === 0) {
        if (defaultValue.value.length > 0) {
          defaultValue.value = [];
        }
        return;
      }

      if (!isDefaultValueResolved) {
        const optionsSource = options.options();
        if (optionsSource && typeof optionsSource === "function") {
          try {
            defaultOptionLoading.value = true;
            const idsToFetch = modelAsArrayValueIds.filter((id) => id != null) as string[];

            if (
              idsToFetch.length === 0 &&
              !(
                modelAsArrayValueIds.length === 1 &&
                modelAsArrayValueIds[0] == null &&
                options.mapOptions() &&
                !options.multiple()
              )
            ) {
              defaultValue.value = [];
              defaultOptionLoading.value = false;
              return;
            }

            const data = await optionsSource(undefined, undefined, idsToFetch);

            if (typeof data === "object" && !Array.isArray(data) && "results" in data && data.results) {
              const results = data.results as Option[];
              defaultValue.value = results.filter((rOpt) =>
                modelAsArrayValueIds.some((mId) => isEqual(options.getOptionValue.value(rOpt), mId)),
              );
            } else {
              defaultValue.value = [];
            }
          } catch (e) {
            console.error("Error loading default options:", e);
            defaultValue.value = [];
          } finally {
            defaultOptionLoading.value = false;
          }
        } else if (optionsSource && Array.isArray(optionsSource)) {
          defaultValue.value = (optionsSource as Option[]).filter((opt) =>
            modelAsArrayValueIds.some((mId) => isEqual(options.getOptionValue.value(opt), mId)),
          );
        }
      }
    },
    { immediate: true, deep: true },
  );

  return {
    defaultValue,
    defaultOptionLoading,
  };
}
