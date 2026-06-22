import { inject } from "vue";
import { TableQueryStateKey, type TableQueryPatch } from "./types";

export interface UseTableQueryStateReturn {
  /**
   * Read the table view state (sort/search/page) restored from the URL for this
   * table. Returns an empty patch when no persistence service is provided (a
   * standalone table or a non-URL blade), so callers can use it unconditionally.
   */
  read(): TableQueryPatch;
}

/**
 * Reads the table view state (sort/search/page) restored from the URL.
 *
 * A list page calls this in `setup`, reads `{ sort, search, page }`, and seeds its
 * own refs before its loader runs, so a reload makes one request. Read-only: the
 * write-back (view state → URL) stays inside VcDataTable via useTableQueryPersistence.
 *
 * @param stateKey  The same `state-key` passed to VcDataTable for this table.
 */
export function useTableQueryState(stateKey?: string): UseTableQueryStateReturn {
  const service = inject(TableQueryStateKey, undefined);

  return {
    read: () => (service ? service.read(stateKey) : {}),
  };
}
