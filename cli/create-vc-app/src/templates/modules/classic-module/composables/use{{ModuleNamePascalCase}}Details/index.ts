import { computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";

export default () => {
  const item = ref({});

  // Implement your own load function
  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = {};
  });

  const loading = useLoading(itemLoading);

  return {
    item: computed(() => item.value),
    loading: computed(() => loading.value),
    getItem,
  };
};
