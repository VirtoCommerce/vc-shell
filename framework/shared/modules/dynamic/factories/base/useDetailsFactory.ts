import { ComputedRef, computed, ref, Ref, watch } from "vue";
import * as _ from "lodash-es";
import { useForm, useIsFormDirty, useIsFormValid } from "vee-validate";
import { AsyncAction, useAsync, useLoading } from "../../../../../core/composables";
import { ItemId, IValidationState } from "../types";

export interface UseDetailsFactoryParams<Item> {
  load: (args: ItemId) => Promise<Item>;
  saveChanges: (details: Item) => Promise<Item>;
  remove: (args: ItemId) => Promise<void>;
}

export interface UseDetails<Item> {
  load: AsyncAction<ItemId>;
  saveChanges: AsyncAction<Item>;
  remove: AsyncAction<ItemId>;
  loading: ComputedRef<boolean>;
  item: Ref<Item>;
  validationState: ComputedRef<IValidationState<Item>>;
}

export const useDetailsFactory = <Item>(factoryParams: UseDetailsFactoryParams<Item>) => {
  return function useDetails(): UseDetails<Item> {
    const { setFieldError } = useForm({
      validateOnMount: false,
    });
    const item = ref<Item>();
    const itemTemp = ref<Item>();
    const isModified = ref(false);
    const isFormValid = useIsFormValid();
    const isDirty = useIsFormDirty();
    const isDisabled = computed(() => !isDirty.value || !isFormValid.value);

    const { loading: itemLoading, action: load } = useAsync<ItemId>(async (args) => {
      item.value = await factoryParams.load(args);
      resetModified(item.value);
    });

    const { loading: manageLoading, action: saveChanges } = useAsync<Item>(async (item) => {
      if (validationState.value.valid) {
        await factoryParams.saveChanges(item);
        isModified.value = false;
      } else throw new Error("Form is not valid");
    });

    const { loading: removeLoading, action: remove } = useAsync<ItemId>(async (args) => {
      await factoryParams.remove(args);
    });

    const loading = useLoading(itemLoading, manageLoading, removeLoading);

    const validationState = computed(() => ({
      dirty: isDirty.value,
      valid: isFormValid.value,
      modified: isModified.value,
      disabled: isDisabled.value,
      validated: !isDisabled.value && isModified.value,
      setFieldError,
      resetModified,
    }));

    watch(
      [() => item, () => itemTemp],
      ([state, stateCopy]) => {
        isModified.value = !_.isEqual(stateCopy.value, state.value);
      },
      { deep: true }
    );

    function resetModified(data: Item, updateInitial = false) {
      if (updateInitial) {
        item.value = data;
      }
      itemTemp.value = _.cloneDeep(data);
    }

    return {
      load,
      saveChanges,
      remove,
      loading,
      item: computed(() => item.value),
      validationState,
    };
  };
};
