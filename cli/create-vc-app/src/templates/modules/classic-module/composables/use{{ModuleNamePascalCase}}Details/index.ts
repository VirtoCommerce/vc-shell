import { computed, ref } from "vue";
import { useAsync, useLoading, useModificationTracker } from "@vc-shell/framework";

export default () => {
  const item = ref({});

  const { isModified, currentValue, resetModificationState } = useModificationTracker(item);

  // Implement your own load function
  const { loading: itemLoading, action: getItem } = useAsync<{ id: string }>(async (payload) => {
    item.value = {};

    resetModificationState();
  });

  const loading = useLoading(itemLoading);

  return {
    item: currentValue,
    loading: computed(() => loading.value),
    getItem,
    isModified,
  };
};
