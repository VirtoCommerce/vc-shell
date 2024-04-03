import { computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";

export default () => {
  const data = ref([]);
  const dataRes = ref();

  // Implement your own load function
  const { loading: itemLoading, action: getItems } = useAsync(async (payload) => {
    data.value = [];
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
