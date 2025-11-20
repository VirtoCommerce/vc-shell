import { ref, computed, Ref } from "vue";
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OffersClient } from "../../../api_client";
import type { SearchOffersQuery, IOfferListItem } from "../types";

export default function useOffersList() {
  const { getApiClient } = useApiClient(OffersClient);

  // State
  const items: Ref<IOfferListItem[]> = ref([]);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const settings = ref({
    allowDefault: true,
  });

  // Computed
  const pages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  // Load offers
  const { action: loadOffers, loading } = useAsync(
    async (options?: { page?: number; keyword?: string; sort?: string }) => {
      const client = await getApiClient();

      const query: SearchOffersQuery = {
        skip: ((options?.page || currentPage.value) - 1) * pageSize.value,
        take: pageSize.value,
        keyword: options?.keyword,
        sort: options?.sort,
      };

      const result = await client.searchOffers(query);

      items.value = result.results || [];
      totalCount.value = result.totalCount || 0;

      if (options?.page) {
        currentPage.value = options.page;
      }

      return result;
    }
  );

  // Delete offers
  async function deleteOffers(ids: string[]) {
    const client = await getApiClient();

    if (ids.length === 1) {
      await client.deleteOffers(ids);
    } else {
      await client.bulkDeleteOffers({ ids });
    }
  }

  return {
    items,
    loading,
    totalCount,
    currentPage,
    pageSize,
    pages,
    settings,
    loadOffers,
    deleteOffers,
  };
}
