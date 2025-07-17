import { Ref, computed, ref } from "vue";
import { useAsync, useLoading, useModificationTracker } from "@vc-shell/framework";
import {
  MockedItem,
  addNewMockItem,
  currencyOptions,
  loadMockItem,
  removeMockItem,
  updateMockItem,
} from "../../sample-data";

export default () => {
  const item = ref({}) as Ref<MockedItem>;

  const { isModified, currentValue, resetModificationState } = useModificationTracker(item);

  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = await loadMockItem(payload);
  });

  const { loading: saveLoading, action: saveItem } = useAsync<MockedItem, MockedItem | void>(async (payload) => {
    if (payload) {
      if (payload.id) {
      const _res = await updateMockItem(payload)

      resetModificationState(_res);
      return _res;
      } else {
        const _res = await addNewMockItem(payload);

        resetModificationState(_res);
        return _res;
      }
    }
  });

  const { loading: removeLoading, action: removeItem } = useAsync<{ id: string }>(async (payload) => {
    if (payload) {
      return await removeMockItem(payload);
    }
  });

  const loading = useLoading(itemLoading, saveLoading, removeLoading);

  return {
    item: currentValue,
    loading: computed(() => loading.value),
    currencyOptions: computed(() => currencyOptions),
    isModified,
    getItem,
    saveItem,
    removeItem,
  };
};
