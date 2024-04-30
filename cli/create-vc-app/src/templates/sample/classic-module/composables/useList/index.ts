import { Ref, computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";
import { MockedItem, MockedQuery, loadMockItemsList, removeMockItem } from "../../sample-data";

export interface useClassicAppList {
  data: Ref<MockedItem[]>;
  loading: Ref<boolean>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  currentPage: number;
  getItems: (query: MockedQuery) => void;
  removeItems: (args: { ids: string[] }) => void;
}

export default (): useClassicAppList => {
  const result = ref() as Ref<{ results: MockedItem[]; totalCount: number }>;

  const { loading: itemLoading, action: getItems } = useAsync<MockedQuery>(async (query) => {
    if (query) result.value = await loadMockItemsList(query);
  });

  const { loading: removeLoading, action: removeItems } = useAsync<{ ids: string[] }>(async (args) => {
    if (args) {
      for (const id of args.ids) {
        await removeMockItem({ id });
      }
    }
  });

  const loading = useLoading(itemLoading, removeLoading);

  return {
    data: computed(() => result.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => result.value?.totalCount),
    pages: computed(() => Math.ceil(result.value?.totalCount / 20)),
    currentPage: 0 / Math.max(1, 20) + 1,
    getItems,
    removeItems,
  };
};
