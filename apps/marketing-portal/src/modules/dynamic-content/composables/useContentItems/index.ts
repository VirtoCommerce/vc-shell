import {
  DynamicContentItemSearchCriteria,
  DynamicContentListEntry,
  DynamicContentListEntrySearchResult,
  IDynamicContentItemSearchCriteria,
  MarketingModuleDynamicContentClient,
} from "@virtoshell/api-client";
import { useLogger, useUser } from "@virtoshell/core";
import { computed, Ref, ref } from "vue";

export interface IUseContentItems {
  readonly contentItems: Ref<DynamicContentListEntry[]>;
  readonly loading: Ref<boolean>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly currentPage: Ref<number>;
  searchQuery: Ref<IDynamicContentItemSearchCriteria>;
  loadContentItems(query?: IDynamicContentItemSearchCriteria);
}

export default (): IUseContentItems => {
  const logger = useLogger();
  const searchResult = ref<DynamicContentListEntrySearchResult>();
  const loading = ref(false);
  const currentPage = ref(1);
  const searchQuery = ref<IDynamicContentItemSearchCriteria>({
    take: 20,
  });

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModuleDynamicContentClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadContentItems(query?: IDynamicContentItemSearchCriteria) {
    const client = await getApiClient();

    try {
      loading.value = true;
      searchQuery.value = { ...searchQuery.value, ...query };
      searchResult.value = await client.dynamicContentItemsEntriesSearch({
        ...searchQuery.value,
      } as DynamicContentItemSearchCriteria);

      currentPage.value =
        (searchQuery.value.skip || 0) /
          Math.max(1, searchQuery.value.take || 20) +
        1;
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    contentItems: computed(() => searchResult.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / 20)),
    currentPage: computed(() => currentPage.value),
    searchQuery,
    loadContentItems,
  };
};
