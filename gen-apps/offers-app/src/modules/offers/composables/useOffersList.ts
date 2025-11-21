import { computed, ref, ComputedRef, Ref } from "vue";
import { useAsync, useApiClient } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

// TODO: Replace with your actual API client imports
// Example: import { ProductsClient, IProduct, IProductSearchQuery, ProductSearchResult } from "@your-app/api/products";

// @ts-expect-error - Replace with your API types
interface IOffersSearchQuery {
  take?: number;
  skip?: number;
  keyword?: string;
  sort?: string;
  // Add your filter fields here
  status?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: any;
}

// @ts-expect-error - Replace with your API types
interface IOffers {
  id?: string;
  name?: string;
  createdDate?: string;
  [key: string]: any;
}

// @ts-expect-error - Replace with your search result type
interface OffersSearchResult {
  results?: IOffers[];
  totalCount?: number;
}

// @ts-expect-error - Replace with your API client
class OffersClient {
  // TODO: Replace these mock methods with your actual API client methods
  async searchOfferss(query: IOffersSearchQuery): Promise<OffersSearchResult> {
    throw new Error("Method not implemented. Replace with your actual API method.");
  }
}

interface FilterState {
  status: string[];
  startDate?: string;
  endDate?: string;
  [key: string]: string[] | string | undefined;
}

export interface IUseOffersList {
  items: ComputedRef<IOffers[]>;
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  searchQuery: Ref<IOffersSearchQuery>;
  loadOfferss: (query?: IOffersSearchQuery) => Promise<void>;
  loading: ComputedRef<boolean>;
  statuses: ComputedRef<Array<{ value: string | undefined; displayValue: string | undefined }>>;

  // Filters - staged/applied architecture
  stagedFilters: Ref<FilterState>;
  appliedFilters: Ref<FilterState>;
  hasFilterChanges: ComputedRef<boolean>;
  hasFiltersApplied: ComputedRef<boolean>;
  activeFilterCount: ComputedRef<number>;
  toggleFilter: (filterType: keyof FilterState, value: string, checked: boolean) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  resetSearch: () => Promise<void>;
}

export interface UseOffersListOptions {
  pageSize?: number;
  sort?: string;
}

// Example status enum - customize for your entity
enum OffersStatus {
  Active = "Active",
  Inactive = "Inactive",
  Pending = "Pending",
}

export function useOffersList(options?: UseOffersListOptions): IUseOffersList {
  const { getApiClient } = useApiClient(OffersClient);
  const { t } = useI18n({ useScope: "global" });

  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<IOffersSearchQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<OffersSearchResult>();

  const { action: loadOfferss, loading: loadingOfferss } = useAsync<IOffersSearchQuery>(async (_query) => {
    searchQuery.value = { ...searchQuery.value, ...(_query || {}) };

    const apiClient = await getApiClient();
    searchResult.value = await apiClient.searchOfferss(searchQuery.value);
  });

  // Filter state with staged/applied architecture
  const stagedFilters = ref<FilterState>({ status: [] });
  const appliedFilters = ref<FilterState>({ status: [] });

  const hasFilterChanges = computed((): boolean => {
    // Deep comparison of filter arrays and values
    const stagedStatus = [...stagedFilters.value.status].sort();
    const appliedStatus = [...appliedFilters.value.status].sort();

    return (
      JSON.stringify(stagedStatus) !== JSON.stringify(appliedStatus) ||
      stagedFilters.value.startDate !== appliedFilters.value.startDate ||
      stagedFilters.value.endDate !== appliedFilters.value.endDate
    );
  });

  const hasFiltersApplied = computed((): boolean => {
    return appliedFilters.value.status.length > 0 || !!appliedFilters.value.startDate || !!appliedFilters.value.endDate;
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
      const currentFilters = [...stagedFilters.value.status];

      if (checked) {
        // For status, use radio behavior - replace all with single value
        stagedFilters.value = {
          ...stagedFilters.value,
          status: [value],
        };
      } else {
        stagedFilters.value = {
          ...stagedFilters.value,
          status: currentFilters.filter((item) => item !== value),
        };
      }
    } else if (filterType === "startDate" || filterType === "endDate") {
      stagedFilters.value = {
        ...stagedFilters.value,
        [filterType]: value || undefined,
      };
    }
  };

  const applyFilters = async () => {
    // Deep copy staged to applied
    appliedFilters.value = {
      status: [...stagedFilters.value.status],
      startDate: stagedFilters.value.startDate,
      endDate: stagedFilters.value.endDate,
    };

    // Convert to API query format with proper Date types
    const queryWithFilters = {
      ...searchQuery.value,
      status: appliedFilters.value.status.length > 0 ? appliedFilters.value.status[0] : undefined,
      startDate: appliedFilters.value.startDate ? new Date(appliedFilters.value.startDate) : undefined,
      endDate: appliedFilters.value.endDate ? new Date(appliedFilters.value.endDate) : undefined,
      skip: 0, // Reset pagination
    };

    await loadOfferss(queryWithFilters);
  };

  const resetFilters = async () => {
    stagedFilters.value = { status: [] };
    appliedFilters.value = { status: [] };

    const queryWithoutFilters = {
      ...searchQuery.value,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      skip: 0,
    };

    await loadOfferss(queryWithoutFilters);
  };

  const resetSearch = async () => {
    stagedFilters.value = { status: [] };
    appliedFilters.value = { status: [] };

    const resetQuery = {
      take: pageSize,
      sort: options?.sort,
      skip: 0,
      keyword: "",
    };

    await loadOfferss(resetQuery);
  };

  // Computed properties
  const items = computed(() => searchResult.value?.results || []);
  const totalCount = computed(() => searchResult.value?.totalCount || 0);
  const pages = computed(() => Math.ceil(totalCount.value / pageSize));
  const currentPage = computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1);
  const loading = computed(() => loadingOfferss.value);

  // Example statuses - customize for your entity
  const statuses = computed(() => {
    const statusEntries = Object.entries(OffersStatus);
    return statusEntries.map(([value, displayValue]) => ({
      value,
      displayValue: t(`OFFERS.PAGES.LIST.TABLE.FILTER.STATUS.${displayValue}`),
    }));
  });

  return {
    items,
    totalCount,
    pages,
    currentPage,
    searchQuery,
    loadOfferss,
    loading,
    statuses,

    // Filters
    stagedFilters,
    appliedFilters,
    hasFilterChanges,
    hasFiltersApplied,
    activeFilterCount,
    toggleFilter,
    applyFilters,
    resetFilters,
    resetSearch,
  };
}
