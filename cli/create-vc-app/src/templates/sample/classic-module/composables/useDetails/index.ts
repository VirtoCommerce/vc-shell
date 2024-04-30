import { Ref, computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";
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

  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = await loadMockItem(payload);
  });

  const { loading: saveLoading, action: saveItem } = useAsync<MockedItem, MockedItem | void>(async (payload) => {
    if (payload) {
      return payload.id ? await updateMockItem(payload) : await addNewMockItem(payload);
    }
  });

  const { loading: removeLoading, action: removeItem } = useAsync<{ id: string }>(async (payload) => {
    if (payload) {
      return await removeMockItem(payload);
    }
  });

  const loading = useLoading(itemLoading, saveLoading, removeLoading);

  return {
    item: computed(() => item.value),
    loading: computed(() => loading.value),
    currencyOptions: computed(() => currencyOptions),
    getItem,
    saveItem,
    removeItem,
  };
};
