import { type Ref, inject, watch } from "vue";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { VcDataTableExtendedProps } from "@ui/components/organisms/vc-data-table/types";

export interface UseTableQueryPersistenceOptions<T extends Record<string, unknown>> {
  /** VcDataTable props (read sortField/sortOrder/searchValue/pagination/stateKey). */
  props: VcDataTableExtendedProps<T>;
  /** VcDataTable emit. */
  emit: (event: string, value?: unknown) => void;
  /** Live search UI state owned by VcDataTable. */
  internalSearchValue: Ref<string>;
}

/**
 * Bridges VcDataTable view state (sort/search/page) with the URL query, via the
 * optional per-blade ITableQueryStateService. No-op when no service is provided
 * (standalone table or non-URL blade).
 *
 * On init it seeds the parent (v-models + search/pagination events) from the
 * restored URL state, then watches for changes and writes them back (the service
 * debounces). To avoid writing back the just-restored values (the parent echoes
 * them as prop changes on a later tick), each field tracks its last-applied value
 * and skips writes that match it — timing-independent, unlike a transient flag.
 */
export function useTableQueryPersistence<T extends Record<string, unknown>>(
  options: UseTableQueryPersistenceOptions<T>,
): void {
  const service = inject(TableQueryStateKey, undefined);
  if (!service) return;

  const { props, emit, internalSearchValue } = options;

  // ── Restore (synchronous, during setup, before the parent's mounted load) ──
  const restored = service.read(props.stateKey);

  // Seed-and-dedup state: remember what we last pushed/applied per field, so the
  // parent's prop echo of the restored values does not bounce back into a write.
  let lastSort: string | undefined = restored.sort;
  let lastSearch = restored.search ?? "";
  let lastPage: number | undefined = restored.page;

  if (restored.sort) {
    const [field, dir] = restored.sort.split(":");
    if (field) {
      const order = dir === "DESC" ? -1 : 1;
      emit("update:sortField", field);
      emit("update:sortOrder", order);
      // Mirror a genuine sort so adapter-based tables (which react only to
      // `@sort`, not the sort-field/sort-order v-models) also restore sort.
      emit("sort", { sortField: field, sortOrder: order });
    }
  }
  if (restored.search !== undefined) {
    internalSearchValue.value = restored.search;
    emit("update:searchValue", restored.search);
    emit("search", restored.search);
  }
  if (restored.page !== undefined) {
    emit("pagination-click", restored.page);
  }

  // ── Write (push genuine view-state changes back to the URL) ────────────────
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
