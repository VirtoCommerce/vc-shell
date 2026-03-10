import { computed, ComputedRef, Ref } from "vue";

export interface HasLoading {
  loading: Readonly<Ref<boolean>>;
}

export type UseLoadingReturn = ComputedRef<boolean>;

export function useLoading(...args: Readonly<Ref<boolean>>[]): UseLoadingReturn {
  return computed(() => args.some((item) => item.value));
}
