import { getCurrentScope, onScopeDispose, readonly, ref, type Ref } from "vue";

export interface LatestRequest {
  /** False once a newer request started, or once the tracker was invalidated or disposed. */
  isCurrent(): boolean;
  /** Marks this request finished. Idempotent; only the current request clears `pending`. */
  complete(): void;
}

export interface UseLatestRequestReturn {
  /**
   * Runs a request and hands back its result only while it is still the newest.
   * A superseded request resolves to `undefined`, so the caller returns early
   * instead of writing a stale answer:
   *
   * ```ts
   * const result = await search.latest(client.searchProducts(criteria));
   * if (!result) return;
   * searchResult.value = result;
   * ```
   *
   * This is `begin`/`isCurrent`/`complete` with the bookkeeping folded in —
   * there is no `finally` to forget. Reach for `begin` directly only when the
   * request and the check cannot sit in the same function.
   *
   * Rejections propagate untouched. `undefined` means superseded, so a request
   * whose own successful result is `undefined` needs `begin` instead.
   */
  latest<T>(request: Promise<T>): Promise<T | undefined>;
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
 *   const result = await search.latest(api.search(criteria));
 *   if (!result) return;              // a newer search won
 *   items.value = result;
 * }
 * ```
 *
 * `begin` is the same thing with the bookkeeping exposed, for the cases where
 * the request and the check cannot sit in the same function.
 *
 * This discards the late result rather than cancelling the request: the
 * generated API clients build their own `RequestInit` and take no `AbortSignal`,
 * so there is nothing to cancel through. Aborting would additionally save the
 * round trip and belongs with a client that accepts a signal.
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

  async function latest<T>(request: Promise<T>): Promise<T | undefined> {
    const tracked = begin();
    try {
      const result = await request;
      return tracked.isCurrent() ? result : undefined;
    } finally {
      tracked.complete();
    }
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
    latest,
    begin,
    invalidate,
    dispose,
    pending: readonly(pending),
  };
}
