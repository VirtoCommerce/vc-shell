import { Ref, computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";
import { MockedItem, loadMockItem } from "../../../mocks";

export default () => {
  const item = ref({}) as Ref<MockedItem>;

  // Example mocked method for 'fetching' list data
  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = await loadMockItem(payload);
  });

  const loading = useLoading(itemLoading);

  return {
    item: computed(() => item.value),
    loading: computed(() => loading.value),
    getItem,
  };
};
