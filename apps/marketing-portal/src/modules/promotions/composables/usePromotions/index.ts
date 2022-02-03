import { useLogger, useUser } from "@virtoshell/core";
import { computed, Ref, ref } from "vue";
import {
  IPromotionSearchCriteria,
  MarketingModulePromotionClient,
  PromotionSearchCriteria,
  PromotionSearchResult,
} from "@virtoshell/api-client";

export interface IUsePromotions {
  readonly promotions: Ref<PromotionSearchResult[]>;
  readonly loading: Ref<boolean>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly currentPage: Ref<number>;
  searchQuery: Ref<IPromotionSearchCriteria>;
  loadPromotions(query?: IPromotionSearchCriteria): void;
}

export default (): IUsePromotions => {
  const { user } = useUser();
  const logger = useLogger();
  const searchResult = ref<PromotionSearchResult>();
  const loading = ref(false);
  const currentPage = ref(1);
  const searchQuery = ref<IPromotionSearchCriteria>({
    take: 20,
  });

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModulePromotionClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadPromotions(query?: IPromotionSearchCriteria) {
    const client = await getApiClient();

    try {
      loading.value = true;
      searchQuery.value = { ...searchQuery.value, ...query };
      const promotionsQuery = new PromotionSearchCriteria(searchQuery.value);
      searchResult.value = await client.promotionsSearch(promotionsQuery);

      currentPage.value =
        (promotionsQuery.skip || 0) / Math.max(1, promotionsQuery.take || 20) +
        1;
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    promotions: computed(() => searchResult.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / 20)),
    currentPage: computed(() => currentPage.value),
    searchQuery,
    loadPromotions,
  };
};
