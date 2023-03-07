import { readonly, ref } from "vue";
import { HasLoading } from "../useLoading";

export type AsyncAction<Payload = void, Result = void> = (payload?: Payload) => Promise<Result>;

export interface UseAsync<Payload = void, Result = void> extends HasLoading {
  action: AsyncAction<Payload, Result>;
}

export function useAsync<Payload = void, Result = void>(
  innerAction: AsyncAction<Payload, Result>
): UseAsync<Payload, Result> {
  const loading = ref(false);

  async function action(payload?: Payload): Promise<Result> {
    loading.value = true;
    try {
      return await innerAction(payload);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    action,
  };
}
