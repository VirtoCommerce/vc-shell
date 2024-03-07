import { Ref, computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";
import { type MockedItem, loadMockItemsList } from "../../../mocks";

export default () => {
  const data = ref([]) as Ref<MockedItem[]>;
  const dataRes = ref();

  // Example mocked method for 'fetching' list data
  const { loading: itemLoading, action: getItems } = useAsync(async (payload) => {
    dataRes.value = await loadMockItemsList();
    data.value = dataRes.value.results;
  });

  const loading = useLoading(itemLoading);

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    totalCount: computed(() => dataRes.value?.totalCount),
    pages: computed(() => Math.ceil(dataRes.value?.totalCount / 20)),
    currentPage: 0 / Math.max(1, 20) + 1,
    getItems,
  };
};
