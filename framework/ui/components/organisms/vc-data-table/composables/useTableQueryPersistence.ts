import { type Ref, inject, watch } from "vue";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { VcDataTableExtendedProps } from "@ui/components/organisms/vc-data-table/types";

export interface UseTableQueryPersistenceOptions<T extends Record<string, unknown>> {
  /** VcDataTable props (read sortField/sortOrder/searchValue/pagination/stateKey). */
  props: VcDataTableExtendedProps<T>;
  /** Live search UI state owned by VcDataTable. */
  internalSearchValue: Ref<string>;
}

/**
 * Bridges VcDataTable view state (sort/search/page) with the URL query, via the
 * optional per-blade ITableQueryStateService. No-op when no service is provided
 * (standalone table or non-URL blade).
 *
 * This handles the write side: it watches sort/search/page and writes them to the
 * URL (the service debounces). To avoid writing back values the page just restored
 * (the parent echoes them as prop changes a tick later), each field remembers its
 * last-applied value and skips writes that match it.
 *
 * It does not push restored state to the page — the page reads it via
 * useTableQueryState. The only restore-side effect here is seeding the table's own
 * search box for display, which does not load.
 */
export function useTableQueryPersistence<T extends Record<string, unknown>>(
  options: UseTableQueryPersistenceOptions<T>,
): void {
  const service = inject(TableQueryStateKey, undefined);
  if (!service) return;

  const { props, internalSearchValue } = options;

  const restored = service.read(props.stateKey);

  // Last value written per field, so the page's prop echo of the restored values
  // is not written back.
  let lastSort: string | undefined = restored.sort;
  let lastSearch = restored.search ?? "";
  let lastPage: number | undefined = restored.page;

  // Show the restored keyword in the table's own search box (display only, no load).
  if (restored.search !== undefined) {
    internalSearchValue.value = restored.search;
  }

  // Write view-state changes back to the URL.
  function currentSortExpression(): string | undefined {
    const field = props.sortField;
    const order = props.sortOrder;
    if (!field || !order) return undefined;
    return `${field}:${order === -1 ? "DESC" : "ASC"}`;
  }

  watch(
    () => [props.sortField, props.sortOrder] as const,
    () => {
      const value = currentSortExpression();
      if (value === lastSort) return;
      lastSort = value;
      service.write(props.stateKey, { sort: value });
    },
  );

  watch(
    () => props.searchValue ?? internalSearchValue.value,
    (raw) => {
      const value = raw || "";
      if (value === lastSearch) return;
      lastSearch = value;
      service.write(props.stateKey, { search: value });
    },
  );

  watch(
    () => props.pagination?.currentPage,
    (page) => {
      if (page == null || page === lastPage) return;
      lastPage = page;
      // Page 1 is the default; clear the param rather than writing `_page=1`.
      service.write(props.stateKey, { page: page === 1 ? undefined : page });
    },
  );
}
