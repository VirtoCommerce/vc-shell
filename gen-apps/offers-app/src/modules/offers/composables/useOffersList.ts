import { Ref, ref, computed, watch } from "vue";
import { offersClient } from "../../../api_client/offers.client";
import type { IOffer, IMarketplaceSettings } from "../types";

export function useOffersList() {
  // State
  const items: Ref<IOffer[]> = ref([]);
  const loading = ref(false);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const searchValue = ref("");
  const sortExpression = ref<string | undefined>("createdDate:desc");
  const selectedItemId = ref<string | undefined>();
  const activeFilterCount = ref(0);
  const settings = ref<IMarketplaceSettings | null>(null);

  // Computed
  const pages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  // Methods
  async function load() {
    loading.value = true;

    try {
      const response = await offersClient.searchOffers({
        skip: (currentPage.value - 1) * pageSize.value,
        take: pageSize.value,
        sort: sortExpression.value,
        keyword: searchValue.value,
      });

      items.value = response.results || [];
      totalCount.value = response.totalCount || 0;
    } catch (error) {
      console.error("[useOffersList] Error loading offers:", error);
      items.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;

    try {
      await offersClient.deleteOffers([id]);
      await load();
    } catch (error) {
      console.error("[useOffersList] Error removing offer:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function bulkDelete(ids: string[]) {
    loading.value = true;

    try {
      await offersClient.bulkDeleteOffers({ ids });
      await load();
    } catch (error) {
      console.error("[useOffersList] Error bulk deleting offers:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function reload() {
    await load();
  }

  async function loadSettings() {
    try {
      settings.value = await offersClient.getSettings();
    } catch (error) {
      console.error("[useOffersList] Error loading settings:", error);
      settings.value = { allowMultipleOffers: false };
    }
  }

  // Auto-reload when search, sort, or page changes
  watch([searchValue, sortExpression, currentPage], () => {
    load();
  });

  return {
    // State
    items,
    loading,
    totalCount,
    pages,
    currentPage,
    pageSize,
    searchValue,
    sortExpression,
    selectedItemId,
    activeFilterCount,
    settings,

    // Methods
    load,
    remove,
    bulkDelete,
    reload,
    loadSettings,
  };
}
