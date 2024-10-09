import { ComputedRef, MaybeRef, computed, ref, watch } from "vue";
import * as _ from "lodash-es";
import { useForm, useIsFormValid } from "vee-validate";
import { useAsync, useLoading } from "../../../../../core/composables";
import type { ItemId, IValidationState, UseDetails } from "../types";
import { createUnrefFn } from "@vueuse/core";

export interface UseDetailsFactoryParams<Item> {
  load: (args?: ItemId) => Promise<Item | undefined> | Item | undefined;
  saveChanges?: (details: Item) => Promise<Item | void> | Item | void;
  remove?: (args: ItemId) => Promise<void> | void;
}

export const useDetailsFactory = <Item extends { id?: string }>(factoryParams: UseDetailsFactoryParams<Item>) => {
  return function useDetails(): UseDetails<Item> {
    const { setFieldError, setErrors, validate, setFieldValue, setValues, errorBag } = useForm({
      validateOnMount: false,
    });
    const item = ref<Item>();
    const itemTemp = ref<Item>();
    const isModified = ref(false);
    const isFormValid = useIsFormValid();
    const isDisabled = computed(() => !isModified.value || !isFormValid.value);

    const { loading: itemLoading, action: load } = useAsync<ItemId>(async (args?: ItemId) => {
      const res = await factoryParams.load(args);

      if (res) {
        item.value = res;
        item.value && resetModified(item.value);
      }
    });

    const { loading: manageLoading, action: saveChanges } = useAsync<Item, Item | undefined>(async (itemToSave) => {
      if (validationState.value.valid) {
        const res = await factoryParams.saveChanges?.(itemToSave as Item);
        isModified.value = false;

        const id = itemToSave?.id ?? res?.id;

        if (id) {
          await load({ id });
        }

        if (res) return res;
      } else throw new Error("Form is not valid");
    });

    const { loading: removeLoading, action: remove } = useAsync<ItemId | Item>(async (args) => {
      await factoryParams.remove?.(args as ItemId);
    });

    const loading = useLoading(itemLoading, manageLoading, removeLoading);

    const validationState = computed(
      (): IValidationState<Item> => ({
        /**
         * @deprecated `dirty` - use `modified` instead
         */
        dirty: isModified.value,
        valid: isFormValid.value,
        modified: isModified.value,
        disabled: isDisabled.value,
        validated: !isDisabled.value && isModified.value,
        cachedValue: itemTemp.value,
        errorBag: errorBag.value,
        setFieldError,
        setErrors,
        setFieldValue,
        setValues,
        resetModified,
        resetValidationState,
        validate,
      }),
    );

    watch(
      [() => item, () => itemTemp],
      ([state, stateCopy]) => {
        isModified.value = !_.isEqual(stateCopy.value, state.value);
      },
      { deep: true },
    );

    const resetModified = createUnrefFn((data: Item, updateInitial = false) => {
      if (updateInitial) {
        item.value = data;

        resetValidationState();
      }

      itemTemp.value = _.cloneDeep(data);
    }) as (data: MaybeRef<Item | undefined> | ComputedRef<Item | undefined>, updateInitial?: MaybeRef<boolean>) => void;

    const resetValidationState = () => {
      isModified.value = false;
    };

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
