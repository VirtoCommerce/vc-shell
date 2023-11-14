import { computed, ref, watch } from "vue";
import * as _ from "lodash-es";
import { useForm, useIsFormDirty, useIsFormValid } from "vee-validate";
import { useAsync, useLoading } from "../../../../../core/composables";
import type { ItemId, IValidationState, UseDetails } from "../types";
import { createUnrefFn } from "@vueuse/core";

export interface UseDetailsFactoryParams<Item> {
  load: (args?: ItemId) => Promise<Item>;
  saveChanges: (details: Item) => Promise<Item | void>;
  remove?: (args: ItemId) => Promise<void>;
}

export const useDetailsFactory = <Item>(factoryParams: UseDetailsFactoryParams<Item>) => {
  return function useDetails(): UseDetails<Item> {
    const { setFieldError, setErrors, validate } = useForm({
      validateOnMount: false,
    });
    const item = ref<Item>();
    const itemTemp = ref<Item>();
    const isModified = ref(false);
    const isFormValid = useIsFormValid();
    const isDirty = useIsFormDirty();
    const isDisabled = computed(() => !isDirty.value || !isFormValid.value);

    const { loading: itemLoading, action: load } = useAsync<ItemId>(async (args?: ItemId) => {
      item.value = await factoryParams.load(args);
      resetModified(item.value);
    });

    const { loading: manageLoading, action: saveChanges } = useAsync<Item>(async (item) => {
      if (validationState.value.valid) {
        await factoryParams.saveChanges(item as Item);
        isModified.value = false;
      } else throw new Error("Form is not valid");
    });

    const { loading: removeLoading, action: remove } = useAsync<ItemId>(async (args) => {
      await factoryParams.remove?.(args as ItemId);
    });

    const loading = useLoading(itemLoading, manageLoading, removeLoading);

    const validationState = computed(
      (): IValidationState<Item> => ({
        dirty: isDirty.value,
        valid: isFormValid.value,
        modified: isModified.value,
        disabled: isDisabled.value,
        validated: !isDisabled.value && isModified.value,
        cachedValue: itemTemp.value,
        setFieldError,
        setErrors,
        resetModified,
        validate,
      })
    );

    watch(
      [() => item, () => itemTemp],
      ([state, stateCopy]) => {
        isModified.value = !_.isEqual(stateCopy.value, state.value);
      },
      { deep: true }
    );

    const resetModified = createUnrefFn((data: Item, updateInitial = false) => {
      if (updateInitial) {
        item.value = data;
      }

      itemTemp.value = _.cloneDeep(data);
    });

    return {
      load,
      saveChanges,
      remove,
      loading,
      item,
      validationState,
    };
  };
};
