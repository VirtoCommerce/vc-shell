import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only: detect VcDataTable list blades / composables that do not persist
 * the table view (sort, search, page) to the blade URL query via the opt-in
 * `stateKey` option (`<key>_sort` / `_search` / `_page`). Flags:
 * - the deprecated `useTableQueryState` / `useTableQueryPersistence`
 * - `useDataTableSort` / `useDataTablePagination` / `useTableSearch` without `stateKey`
 * - a searchable VcDataTable whose keyword is not owned by `useTableSearch`
 *
 * The rewrite is cross-file and behavioural, so the migration-agent applies it.
 * See: migration/50-table-url-state.md
 */

const LEGACY_QUERY_STATE_RE = /\buseTableQueryState\s*\(|\buseTableQueryPersistence\s*\(/;

const USES_SORT_RE = /\buseDataTableSort\s*\(/;
const USES_PAGINATION_RE = /\buseDataTablePagination\s*\(/;
const USES_SEARCH_RE = /\buseTableSearch\s*\(/;
const HAS_STATE_KEY_RE = /\bstateKey\b/;

// A searchable VcDataTable (template signals) — keyword must be owned by useTableSearch.
const DATATABLE_RE = /\bVcDataTable\b/;
const SEARCH_UI_RE = /v-model:search-value|:searchable|@search\b/;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const src = fileInfo.source;
  const path = fileInfo.path;

  // Deprecated preview API — always actionable.
  if (LEGACY_QUERY_STATE_RE.test(src)) {
    api.report(
      `${path}: Uses deprecated useTableQueryState/useTableQueryPersistence. Remove it and pass stateKey to useDataTableSort/useTableSearch/useDataTablePagination. See migration guide: table URL state.`,
    );
    return null;
  }

  const usesStateComposable = USES_SORT_RE.test(src) || USES_PAGINATION_RE.test(src) || USES_SEARCH_RE.test(src);

  // Table state composables present, but no stateKey anywhere → URL persistence is off.
  if (usesStateComposable && !HAS_STATE_KEY_RE.test(src)) {
    api.report(
      `${path}: Table state composables without stateKey — sort/search/page are not persisted to the URL. Add a shared stateKey (e.g. "<module>_list") to useDataTableSort/useTableSearch/useDataTablePagination, reset the page on search, and seed the initial load from pagination.skip. See migration guide: table URL state.`,
    );
    return null;
  }

  // Searchable VcDataTable whose keyword is not owned by useTableSearch.
  if (path.endsWith(".vue") && DATATABLE_RE.test(src) && SEARCH_UI_RE.test(src) && !USES_SEARCH_RE.test(src)) {
    api.report(
      `${path}: Searchable VcDataTable keyword is not owned by useTableSearch — it cannot be persisted to the URL. Introduce useTableSearch({ stateKey }) and bind v-model:search-value. See migration guide: table URL state.`,
    );
  }

  return null; // diagnostic-only
};

export default transform;
export const parser = "tsx";
