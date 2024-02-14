import {
  useApiClient,
  useBladeNavigation,
  useLoading,
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
  SellerProductStatus,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { MaybeRef, ComputedRef, Ref, computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export interface ProductListScope extends ListBaseBladeScope {
  toolbarOverrides: {
    exportCategories: {
      clickHandler: () => Promise<void>;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useProductsList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}): UseList<SellerProduct[], ISearchProductsQuery, ProductListScope> => {
  const { t } = useI18n({ useScope: "global" });
  const listFactory = useListFactory<SellerProduct[], ISearchProductsQuery>({
    load: async (query) => (await getApiClient()).searchProducts(new SearchProductsQuery(query)),
    remove: async (query, customQuery) => {
      const command = new BulkProductsDeleteCommand({
        query: new SearchProductsQuery(query),
        productIds: customQuery.ids ?? [],
        all: customQuery.allSelected,
      });
      if (customQuery.allSelected) {
        command.productIds = undefined;
      }

      return (await getApiClient()).bulkDeleteProducts(command);
    },
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const isExporting = ref(false);

  async function exportCategories() {
    try {
      isExporting.value = true;
      const result = await fetch("/api/vcmp/seller/categories/export", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
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
      link.parentNode?.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      isExporting.value = false;
    }
  }

  async function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
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
    statuses: computed(() => {
      return Object.entries(SellerProductStatus).reduce(
        (acc, [value, displayValue]) => {
          if (value.includes(SellerProductStatus.Approved)) return acc;
          acc.push({
            value,
            displayValue: computed(() => t(`PRODUCTS.PAGES.LIST.FILTERS.STATUS.${displayValue}`)),
          });
          return acc;
        },
        [] as Record<string, MaybeRef<string>>[],
      );
    }),
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
