import { Ref, ref, watch } from "vue";

export interface UseLoading {
  loading: Ref<boolean>;
}

export function useLoading(...args: Readonly<Ref<boolean>>[]): UseLoading {
  const loading = ref(false);

  watch(args, () => {
    loading.value = args.some((item) => item.value);
  });

  return {
    loading,
  };
}
