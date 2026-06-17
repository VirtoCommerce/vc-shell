import type { ComputedRef } from "vue";
import type { Router } from "vue-router";
import type { BladeDescriptor, IBladeStack } from "@core/blade-navigation/types";
import { createUrlSync } from "@core/blade-navigation/utils/urlSync";
import type { ITableQueryStateService, TableQueryPatch } from "./types";
import { encodeQueryState, decodeQueryState } from "./serialization";

const DEBOUNCE_MS = 150;

export interface CreateBladeQueryStateDeps {
  /** The blade this service belongs to (provides id + url for namespacing). */
  descriptor: ComputedRef<BladeDescriptor>;
  /** Router — source of truth for the current URL query. */
  router: Router;
  /** Blade stack — target for descriptor query updates. */
  bladeStack: IBladeStack;
}

/** Remove leading/trailing slashes: "/offers/" → "offers". */
function normalizeSegment(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/^\/+|\/+$/g, "") || undefined;
}

/**
 * Create a per-blade table-query-state service. Persists table view state into
 * the owning blade's descriptor query (namespaced), then replaces the URL.
 *
 * No-op when there is no namespace (no `tableKey` and no `blade.url`).
 */
export function createBladeQueryState(deps: CreateBladeQueryStateDeps): ITableQueryStateService {
  const { descriptor, router, bladeStack } = deps;
  const { syncUrlReplace } = createUrlSync(router, bladeStack);

  // Pending patches keyed by namespace (a blade may host multiple tables).
  // Coalesced across the debounce window so a multi-field change (e.g. a sort
  // that also resets the page) does not lose all but the last field.
  const pending = new Map<string, TableQueryPatch>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function resolveNs(tableKey?: string): string | undefined {
    return tableKey || normalizeSegment(descriptor.value.url);
  }

  function read(tableKey?: string): TableQueryPatch {
    const ns = resolveNs(tableKey);
    if (!ns) return {};

    const decoded = decodeQueryState(ns, router.currentRoute.value.query);

    // Hydrate the descriptor so it matches the URL. On reload, restoreFromUrl
    // reopens blades WITHOUT their query, leaving descriptor.query empty while
    // the address bar still holds the params. If we don't seed it now, the next
    // syncUrlReplace (from any table write or blade open/close) would rebuild
    // the URL from the empty descriptor and wipe the restored state. No URL
    // replace is needed here — the address bar already holds these values.
    if (Object.keys(decoded).length > 0) {
      bladeStack.updateBladeQuery(descriptor.value.id, encodeQueryState(ns, decoded));
    }

    return decoded;
  }

  function write(tableKey: string | undefined, patch: TableQueryPatch): void {
    const ns = resolveNs(tableKey);
    if (!ns) return;

    pending.set(ns, { ...(pending.get(ns) ?? {}), ...patch });

    if (timer != null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      const bladeId = descriptor.value.id;
      for (const [namespace, p] of pending) {
        bladeStack.updateBladeQuery(bladeId, encodeQueryState(namespace, p));
      }
      pending.clear();
      syncUrlReplace();
    }, DEBOUNCE_MS);
  }

  return { read, write };
}
