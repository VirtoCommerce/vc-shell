import { ref, computed, reactive, type MaybeRefOrGetter, toValue } from "vue";

export interface UseDataTablePaginationOptions {
  /** Items per page. Default: 20 */
  pageSize?: MaybeRefOrGetter<number>;
  /** Total item count from API response (reactive) */
  totalCount: MaybeRefOrGetter<number>;
  /** Event callback fired after currentPage updates via goToPage(). */
  onPageChange?: (state: { page: number; skip: number }) => void;
}

export interface UseDataTablePaginationReturn {
  /** Current 1-based page number (writable) */
  currentPage: number;
  /** Total number of pages */
  readonly pages: number;
  /** Current skip offset: (currentPage - 1) * pageSize */
  readonly skip: number;
  /** Resolved page size */
  readonly pageSize: number;
  /** Resolved total item count — pass to VcDataTable :total-count */
  readonly totalCount: number;
  /** Navigate to a specific page. Fires onPageChange if provided. */
  goToPage: (page: number) => void;
  /** Reset to page 1. Does NOT fire onPageChange. */
  reset: () => void;
}

export function useDataTablePagination(options: UseDataTablePaginationOptions): UseDataTablePaginationReturn {
  const pageSize = computed(() => toValue(options.pageSize) ?? 20);
  const currentPage = ref(1);
  const pages = computed(() => Math.ceil(toValue(options.totalCount) / pageSize.value) || 0);
  const skip = computed(() => (currentPage.value - 1) * pageSize.value);
  const totalCount = computed(() => toValue(options.totalCount));

  function goToPage(page: number) {
    currentPage.value = page;
    options.onPageChange?.({ page, skip: skip.value });
  }

  function reset() {
    currentPage.value = 1;
  }

  return reactive({ currentPage, pages, skip, pageSize, totalCount, goToPage, reset });
}
