import { computed, ComputedRef, Ref } from "vue";

export interface HasLoading {
  loading: Readonly<Ref<boolean>>;
}

export function useLoading(...args: Readonly<Ref<boolean>>[]): ComputedRef<boolean> {
  return computed(() => args.some((item) => item.value));
}
