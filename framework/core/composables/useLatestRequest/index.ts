import { getCurrentScope, onScopeDispose, readonly, ref, type Ref } from "vue";

export interface LatestRequest {
  /** False once a newer request started, or once the tracker was invalidated or disposed. */
  isCurrent(): boolean;
  /** Marks this request finished. Idempotent; only the current request clears `pending`. */
  complete(): void;
}

export interface UseLatestRequestReturn {
  /** Starts a request and supersedes any earlier one. */
  begin(): LatestRequest;
  /** Supersedes the in-flight request without starting a new one — e.g. on selection change. */
  invalidate(): void;
  /** Permanently supersedes everything. Called automatically when the owning scope stops. */
  dispose(): void;
  /** True while the newest request is still running. */
  pending: Readonly<Ref<boolean>>;
}

/**
 * Latest-wins sequencing: lets a caller drop a response that a newer request
 * already superseded.
 *
 * ```ts
 * const search = useLatestRequest();
 *
 * async function load(criteria) {
 *   const request = search.begin();
 *   try {
 *     const result = await api.search(criteria);
 *     if (!request.isCurrent()) return;   // a newer search won
 *     items.value = result;
 *   } finally {
 *     request.complete();
 *   }
 * }
 * ```
 *
 * This discards the late result rather than cancelling the request. To also save
 * the round trip, give the client a signal and abort it when a newer request
 * supersedes the last:
 *
 * ```ts
 * const controller = new AbortController();
 * const { getApiClient } = useApiClient(SearchClient, { signal: controller.signal });
 * ```
 *
 * The two compose rather than replace each other: aborting stops the request that
 * is still in flight, and `isCurrent()` still guards a response that had already
 * come back before the newer request started.
 */
export function useLatestRequest(): UseLatestRequestReturn {
  const pending = ref(false);
  let sequence = 0;
  let disposed = false;

  function begin(): LatestRequest {
    const requestId = ++sequence;
    let completed = false;

    if (!disposed) pending.value = true;

    return {
      isCurrent: () => !disposed && requestId === sequence,
      complete: () => {
        if (completed) return;
        completed = true;

        // A superseded request finishing must not clear `pending` — the newer
        // one is still running and the screen is still waiting for its data.
        if (!disposed && requestId === sequence) pending.value = false;
      },
    };
  }

  function invalidate(): void {
    sequence++;
    pending.value = false;
  }

  function dispose(): void {
    disposed = true;
    invalidate();
  }

  // A response landing after its blade closed must not write into a dead scope.
  if (getCurrentScope()) onScopeDispose(dispose);

  return {
    begin,
    invalidate,
    dispose,
    pending: readonly(pending),
  };
}
