/**
 * @file Reference List Composable
 * @description SINGLE SOURCE OF TRUTH for list composable pattern
 * @version 2.0.0
 * @lastUpdated 2025-11-26
 *
 * This is the authoritative example for list composables in VC-Shell.
 * All list composables should follow this pattern exactly.
 *
 * KEY PATTERNS:
 * 1. useAsync<T> - generic type, NOT inline annotation
 * 2. useApiClient - typed API client access
 * 3. ComputedRef for all derived state
 * 4. Ref only for mutable state (searchQuery)
 * 5. Staged/applied filter architecture
 */

import { computed, ref, ComputedRef, Ref } from "vue";
import { useAsync, useApiClient } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

// =============================================================================
// TYPES - Define in api_client/{module}.api.ts
// =============================================================================

/** Search query parameters */
export interface IProductSearchQuery {
  take?: number;
  skip?: number;
  keyword?: string;
  sort?: string;
  // Filter fields
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

/** Entity interface */
export interface IProduct {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  status?: string;
  createdDate?: string;
}

/** Search result wrapper */
export interface ProductSearchResult {
  results?: IProduct[];
  totalCount?: number;
}

// =============================================================================
// API CLIENT - Define in api_client/{module}.client.ts
// =============================================================================

// This would be imported from your API client
declare class ProductClient {
  searchProducts(query: IProductSearchQuery): Promise<ProductSearchResult>;
}

// =============================================================================
// FILTER STATE - For staged/applied filter pattern
// =============================================================================

interface FilterState {
  status: string[];
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// COMPOSABLE INTERFACE - Export for type safety
// =============================================================================

export interface IUseProductList {
  // State (all ComputedRef except mutable searchQuery)
  items: ComputedRef<IProduct[]>;
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  loading: ComputedRef<boolean>;
  searchQuery: Ref<IProductSearchQuery>;

  // Actions
  loadProducts: (query?: IProductSearchQuery) => Promise<void>;

  // Filters (staged/applied architecture)
  stagedFilters: Ref<FilterState>;
  appliedFilters: Ref<FilterState>;
  hasFilterChanges: ComputedRef<boolean>;
  hasFiltersApplied: ComputedRef<boolean>;
  activeFilterCount: ComputedRef<number>;
  toggleFilter: (filterType: keyof FilterState, value: string, checked: boolean) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
}

export interface UseProductListOptions {
  pageSize?: number;
  sort?: string;
}

// =============================================================================
// COMPOSABLE IMPLEMENTATION
// =============================================================================

export function useProductList(options?: UseProductListOptions): IUseProductList {
  const { getApiClient } = useApiClient(ProductClient);
  const { t } = useI18n({ useScope: "global" });

  // Configuration
  const pageSize = options?.pageSize ?? 20;

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  // Mutable query state (Ref - can be modified)
  const searchQuery = ref<IProductSearchQuery>({
    take: pageSize,
    sort: options?.sort,
  });

  // Internal result storage
  const searchResult = ref<ProductSearchResult>();

  // ---------------------------------------------------------------------------
  // ASYNC ACTIONS - useAsync with generic type
  // ---------------------------------------------------------------------------

  /**
   * ⚠️ CRITICAL: useAsync Generic Type Pattern
   *
   * ✅ CORRECT: useAsync<ParamType>(async (params) => { ... })
   *    - params is typed as ParamType | undefined
   *    - Use nullish coalescing: params ?? {}
   *
   * ❌ WRONG: useAsync(async (params: ParamType) => { ... })
   *    - TypeScript thinks params is ALWAYS defined
   *    - Runtime crash when called without params!
   */
  const { action: loadProducts, loading: loadingProducts } = useAsync<IProductSearchQuery>(
    async (params) => {
      // Merge with defaults using nullish coalescing (NOT || which fails on 0/"")
      searchQuery.value = { ...searchQuery.value, ...(params ?? {}) };

      const apiClient = await getApiClient();
      searchResult.value = await apiClient.searchProducts(searchQuery.value);
    }
  );

  // ---------------------------------------------------------------------------
  // FILTERS - Staged/Applied Architecture
  // ---------------------------------------------------------------------------

  const stagedFilters = ref<FilterState>({ status: [] });
  const appliedFilters = ref<FilterState>({ status: [] });

  const hasFilterChanges = computed((): boolean => {
    const stagedStatus = [...stagedFilters.value.status].sort();
    const appliedStatus = [...appliedFilters.value.status].sort();

    return (
      JSON.stringify(stagedStatus) !== JSON.stringify(appliedStatus) ||
      stagedFilters.value.startDate !== appliedFilters.value.startDate ||
      stagedFilters.value.endDate !== appliedFilters.value.endDate
    );
  });

  const hasFiltersApplied = computed((): boolean => {
    return (
      appliedFilters.value.status.length > 0 ||
      !!appliedFilters.value.startDate ||
      !!appliedFilters.value.endDate
    );
  });

  const activeFilterCount = computed((): number => {
    let count = 0;
    if (appliedFilters.value.status.length > 0) count++;
    if (appliedFilters.value.startDate) count++;
    if (appliedFilters.value.endDate) count++;
    return count;
  });

  const toggleFilter = (filterType: keyof FilterState, value: string, checked: boolean) => {
    if (filterType === "status") {
      if (checked) {
        stagedFilters.value = { ...stagedFilters.value, status: [value] };
      } else {
        stagedFilters.value = {
          ...stagedFilters.value,
          status: stagedFilters.value.status.filter((s) => s !== value),
        };
      }
    } else {
      stagedFilters.value = { ...stagedFilters.value, [filterType]: value || undefined };
    }
  };

  const applyFilters = async () => {
    appliedFilters.value = {
      status: [...stagedFilters.value.status],
      startDate: stagedFilters.value.startDate,
      endDate: stagedFilters.value.endDate,
    };

    await loadProducts({
      ...searchQuery.value,
      status: appliedFilters.value.status[0],
      startDate: appliedFilters.value.startDate ? new Date(appliedFilters.value.startDate) : undefined,
      endDate: appliedFilters.value.endDate ? new Date(appliedFilters.value.endDate) : undefined,
      skip: 0,
    });
  };

  const resetFilters = async () => {
    stagedFilters.value = { status: [] };
    appliedFilters.value = { status: [] };

    await loadProducts({
      ...searchQuery.value,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      skip: 0,
    });
  };

  // ---------------------------------------------------------------------------
  // COMPUTED - All derived state as ComputedRef
  // ---------------------------------------------------------------------------

  const items = computed(() => searchResult.value?.results ?? []);
  const totalCount = computed(() => searchResult.value?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / pageSize));
  const currentPage = computed(() => Math.floor((searchQuery.value.skip ?? 0) / pageSize) + 1);
  const loading = computed(() => loadingProducts.value);

  // ---------------------------------------------------------------------------
  // RETURN - Explicit interface for type safety
  // ---------------------------------------------------------------------------

  return {
    // State
    items,
    totalCount,
    pages,
    currentPage,
    loading,
    searchQuery,

    // Actions
    loadProducts,

    // Filters
    stagedFilters,
    appliedFilters,
    hasFilterChanges,
    hasFiltersApplied,
    activeFilterCount,
    toggleFilter,
    applyFilters,
    resetFilters,
  };
}
