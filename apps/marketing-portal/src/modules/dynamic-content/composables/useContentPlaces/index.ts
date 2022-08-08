import {
  DynamicContentListEntry,
  DynamicContentListEntrySearchResult,
  DynamicContentPlaceSearchCriteria,
  IDynamicContentPlaceSearchCriteria,
  MarketingModuleDynamicContentClient,
} from "../../../../api_client/marketing";
import { useLogger, useUser } from "@virtoshell/core";
import { computed, Ref, ref } from "vue";

export interface IUseContentPlaces {
  readonly contentPlaces: Ref<DynamicContentListEntry[]>;
  readonly loading: Ref<boolean>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly currentPage: Ref<number>;
  readonly searchQuery: Ref<IDynamicContentPlaceSearchCriteria>;
  loadContentPlaces(query?: IDynamicContentPlaceSearchCriteria);
}

export interface IUseContentPlacesOptions {
  folderId?: string;
  responseGroup?: string;
}

export default (options?: IUseContentPlacesOptions): IUseContentPlaces => {
  const logger = useLogger();
  const searchResult = ref<DynamicContentListEntrySearchResult>();
  const loading = ref(false);
  const currentPage = ref(1);
  const searchQuery = ref<IDynamicContentPlaceSearchCriteria>();
  const computedSearchQuery = computed(() => {
    searchQuery.value = {
      take: 20,
      folderId: options?.folderId,
      responseGroup: options?.responseGroup,
    };
    return searchQuery.value;
  });

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadContentPlaces(query?: IDynamicContentPlaceSearchCriteria) {
    const client = await getApiClient();

    try {
      loading.value = true;
      searchQuery.value = { ...computedSearchQuery.value, ...query };
      searchResult.value = await client.dynamicContentPlaceListEntriesSearch({
        ...searchQuery.value,
      } as DynamicContentPlaceSearchCriteria);

      currentPage.value =
        (computedSearchQuery.value.skip || 0) /
          Math.max(1, searchQuery.value.take || 20) +
        1;
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    contentPlaces: computed(() => searchResult.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / 20)),
    currentPage: computed(() => currentPage.value),
    searchQuery: computed(() => computedSearchQuery.value),
    loadContentPlaces,
  };
};
