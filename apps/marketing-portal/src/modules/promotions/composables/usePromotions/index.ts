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
}

export default () => {
  const { user } = useUser();
  const logger = useLogger();
  const searchResult = ref<PromotionSearchResult>();
  const loading = ref(false);
  const currentPage = ref(1);

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new MarketingModulePromotionClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadPromotions(query: IPromotionSearchCriteria) {
    const client = await getApiClient();

    try {
      loading.value = true;
      searchResult.value = await client.promotionsSearch({
        ...(query || {}),
        take: 20,
      } as PromotionSearchCriteria);

      currentPage.value = (query.skip || 0) / Math.max(1, query.take || 15) + 1;
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    promotions: computed(() => searchResult.value?.results),
  };
};
