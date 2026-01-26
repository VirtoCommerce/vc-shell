/* eslint-disable @typescript-eslint/no-explicit-any */
import { readonly, ref } from "vue";
import { HasLoading } from "../useLoading";
import { createLogger } from "../../utilities";

const logger = createLogger("use-async");

export type AsyncAction<Payload = void, Result = void> = (payload?: Payload, ...rest: any[]) => Promise<Result>;

export interface UseAsync<Payload = void, Result = void> extends HasLoading {
  action: AsyncAction<Payload, Result>;
}

export function useAsync<Payload = void, Result = void>(
  innerAction: AsyncAction<Payload, Result>,
): UseAsync<Payload, Result> {
  const loading = ref(false);

  async function action(payload?: Payload, ...rest: any[]): Promise<Result> {
    loading.value = true;
    try {
      return await innerAction(payload, ...rest);
    } catch (e) {
      logger.error("Async action failed:", e);
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
