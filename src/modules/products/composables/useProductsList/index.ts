import {
  useApiClient,
  useBladeNavigation,
  useLoading,
  useUser,
  UseList,
  DynamicBladeList,
  useListFactory,
  ListBaseBladeScope,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  SellerProduct,
  ISearchProductsQuery,
  SearchProductsQuery,
  BulkProductsDeleteCommand,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export interface ProductListScope extends ListBaseBladeScope {
  toolbarOverrides: {
    exportCategories: {
      clickHandler: () => Promise<void>;
    };
  };
}

export const useProductsList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}): UseList<SellerProduct[], ISearchProductsQuery, ProductListScope> => {
  const listFactory = useListFactory<SellerProduct[], ISearchProductsQuery>({
    load: async (query) => (await getApiClient()).searchProducts(new SearchProductsQuery(query)),
    remove: async (query, customQuery) => {
      const command = new BulkProductsDeleteCommand({
        query: new SearchProductsQuery(query),
        productIds: customQuery.ids,
        all: customQuery.allSelected,
      });
      if (customQuery.allSelected) {
        command.productIds = null;
      }

      return (await getApiClient()).bulkDeleteProducts(command);
    },
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const isExporting = ref(false);

  async function exportCategories() {
    const { getAccessToken } = useUser();
    const authToken = await getAccessToken();

    try {
      isExporting.value = true;
      const result = await fetch("/api/vcmp/seller/categories/export", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json-patch+json",
        },
      });

      const blob = await result.blob();
      const newBlob = new Blob([blob]);

      const blobUrl = window.URL.createObjectURL(newBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `exported-categories.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      isExporting.value = false;
    }
  }

  function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    openBlade({
      blade: resolveBladeByName("Product"),
      ...args,
    });
  }

  const scope = ref<ProductListScope>({
    openDetailsBlade,
    toolbarOverrides: {
      exportCategories: {
        async clickHandler() {
          await exportCategories();
        },
      },
    },
  });

  return {
    loading: useLoading(loading, isExporting),
    items,
    query,
    pagination,
    load,
    remove,
    scope: computed(() => scope.value),
  };
};