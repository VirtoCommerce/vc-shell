import { ref, computed, type Ref, type ComputedRef, type MaybeRefOrGetter, toValue } from "vue";
import type { DataTablePagination } from "@ui/components/organisms/vc-data-table/types";

export interface UseDataTablePaginationOptions {
  /** Items per page. Default: 20 */
  pageSize?: MaybeRefOrGetter<number>;
  /** Total item count from API response (reactive) */
  totalCount: MaybeRefOrGetter<number>;
  /** Event callback fired after currentPage updates via goToPage(). */
  onPageChange?: (state: { page: number; skip: number }) => void;
}

export interface UseDataTablePaginationReturn {
  /** Current 1-based page number */
  currentPage: Ref<number>;
  /** Total number of pages */
  pages: ComputedRef<number>;
  /** Current skip offset: (currentPage - 1) * pageSize */
  skip: ComputedRef<number>;
  /** Resolved page size */
  pageSize: ComputedRef<number>;
  /** Ready-made prop object for VcDataTable :pagination binding */
  paginationProps: ComputedRef<DataTablePagination>;
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

  const paginationProps = computed<DataTablePagination>(() => ({
    currentPage: currentPage.value,
    pages: pages.value,
    pageSize: pageSize.value,
  }));

  function goToPage(page: number) {
    currentPage.value = page;
    options.onPageChange?.({ page, skip: skip.value });
  }

  function reset() {
    currentPage.value = 1;
  }

  return { currentPage, pages, skip, pageSize, paginationProps, goToPage, reset };
}
