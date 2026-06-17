import type { InjectionKey } from "vue";

/** Partial table view state persisted to the URL query. */
export interface TableQueryPatch {
  /** Sort expression, e.g. "name:ASC" | "name:DESC". `undefined`/"" clears it. */
  sort?: string;
  /** Free-text search value. `undefined`/"" clears it. */
  search?: string;
  /** 1-based current page. `undefined` clears it. */
  page?: number;
}

/**
 * Per-blade service that persists table view state (sort/search/page) into the
 * URL query. Provided by the blade rendering layer for URL-addressable blades;
 * absent for standalone tables (then VcDataTable simply does not persist).
 */
export interface ITableQueryStateService {
  /** Read the restored view state for a table from the current URL. */
  read(tableKey?: string): TableQueryPatch;
  /** Persist a patch of the view state (debounced → URL replace). */
  write(tableKey: string | undefined, patch: TableQueryPatch): void;
}

/** Injection key — value is `undefined` when no blade provides the service. */
export const TableQueryStateKey: InjectionKey<ITableQueryStateService | undefined> = Symbol("TableQueryState");
