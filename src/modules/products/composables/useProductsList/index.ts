import {
  useApiClient,
  useBladeNavigation,
  useLoading,
  UseList,
  ListComposableArgs,
  useListFactory,
  ListBaseBladeScope,
  TOpenBladeArgs,
  useAsync,
  TListItemClickArgs,
  useBreadcrumbs,
  ITableConfig,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  SellerProduct,
  ISearchProductsQuery,
  SearchProductsQuery,
  BulkProductsDeleteCommand,
  SellerProductStatus,
  ISeller,
  ISellerProduct,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import {
  CatalogModuleListEntryClient,
  CatalogListEntrySearchCriteria,
  ListEntryBase,
  IListEntryBase,
  ICatalogListEntrySearchCriteria,
} from "@vcmp-vendor-portal/api/catalog";
import { MaybeRef, ComputedRef, Ref, computed, ref, inject, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);
const { getApiClient: getListEntriesClient } = useApiClient(CatalogModuleListEntryClient);

export interface ProductListScope extends ListBaseBladeScope {
  isCatalogView: Ref<boolean>;
  toolbarOverrides?: {
    exportCategories: {
      clickHandler: () => Promise<void>;
    };
  };
  statuses: ComputedRef<Record<string, MaybeRef<string>>[]>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useProductsList = (
  args: ListComposableArgs,
): UseList<
  SellerProduct[] | ListEntryBase[],
  (ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string },
  ProductListScope
> => {
  const { t } = useI18n({ useScope: "global" });
  const listFactory = useListFactory<
    SellerProduct[] | ListEntryBase[],
    (ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string }
  >({
    load: async (query) => {
      return await loadWrapper(query);
    },
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
  const { openBlade, resolveBladeByName, setNavigationQuery } = useBladeNavigation();
  const { breadcrumbs, push: pushBc, remove: removeBc } = useBreadcrumbs();
  const route = useRoute();

  const isExporting = ref(false);
  const isCatalogView = ref(false);

  const currentSeller = inject("currentSeller", toRef({ id: route?.params?.sellerId })) as Ref<ISeller>;

  async function loadWrapper(q: (ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string }) {
    const sellerId = currentSeller.value.id;
    if (!isCatalogView.value) {
      const productsQuery = new SearchProductsQuery({ ...(q || {}), sellerId: sellerId });
      return (await getApiClient()).searchProducts(productsQuery);
    } else {
      const res = await getListEntries({ ...q, sellerId, query: query.value });

      if (!q.id) {
        pushBc({
          id: sellerId ?? "catalog",
          title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.BREADCRUMBS.CATALOG")),
          clickHandler: async () => {
            await load({
              catalogId: sellerId,
            });
          },
        });
      }

      return res;
    }
  }

  const { loading: listEntriesLoading, action: getListEntries } = useAsync(
    async (args?: {
      sellerId?: string;
      id?: string;
      query?: (ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string };
    }) => {
      const sellerId = currentSeller.value.id;

      const listEntries = await (
        await getListEntriesClient()
      ).listItemsSearch(
        new CatalogListEntrySearchCriteria({
          ...args,
          catalogId: args?.sellerId,
          categoryId: args?.id,
          responseGroup: "withCategories, withProducts",
          searchInVariations: false,
        }),
      );

      const products = listEntries.results?.filter((x) => x.type === "product");

      if (products?.length) {
        const productsQuery = new SearchProductsQuery({
          ...(args?.query || {}),
          sellerId: sellerId,
          stagedProductsIds: sellerId
            ? products?.map((x) => x.id).filter((id): id is string => id !== undefined)
            : undefined,
          publishedProductsIds: !sellerId
            ? products?.map((x) => x.id).filter((id): id is string => id !== undefined)
            : undefined,
        });
        const sellerProducts = await (await getApiClient()).searchProducts(productsQuery);

        const mappedListEntries = {
          results: listEntries.results
            ?.map((x) => {
              if (x.type === "product") {
                const product = sellerProducts.results?.find((y) => y.stagedProductDataId === x.id);

                return product;
              }
              return x;
            })
            .filter((x): x is SellerProduct & ListEntryBase => x !== undefined),
          totalCount: listEntries.totalCount,
        };

        return mappedListEntries;
      }

      return listEntries;
    },
  );

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

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("Product"),
      ...args,
    });
  }

  async function onListItemClick(args?: TListItemClickArgs) {
    if (isCatalogView.value) {
      if (args?.item?.type !== "category") {
        await openBlade({
          blade: resolveBladeByName("Product"),
          param: args?.item?.id,
          onOpen: args?.onOpen,
          onClose: args?.onClose,
        });

        return;
      }

      pushBc({
        id: args?.item?.id,
        title: args?.item?.name,
        clickHandler: async () => {
          await load({ ...query.value, id: args?.item?.id });
        },
      });

      await load({ ...query.value, id: args?.item?.id });
    } else {
      await openBlade({
        blade: resolveBladeByName("Product"),
        param: args?.item?.id,
        onOpen: args?.onOpen,
        onClose: args?.onClose,
      });
    }
  }

  const scope: ProductListScope = {
    isCatalogView,
    setView: async (view: boolean) => {
      isCatalogView.value = view;

      if (!view && breadcrumbs.value.length) {
        removeBc(breadcrumbs.value.map((x) => x.id));
      }

      query.value = { skip: 0, take: query.value.take, sort: query.value.sort };

      setNavigationQuery(query.value as Record<string, string | number>);

      await load(query.value);
    },
    breadcrumbs,
    openDetailsBlade,
    onListItemClick: onListItemClick,
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
          if (value.includes(SellerProductStatus.Approved) || value.includes(SellerProductStatus.RequiresChanges))
            return acc;
          acc.push({
            value,
            displayValue: computed(() => t(`PRODUCTS.PAGES.LIST.FILTERS.STATUS.${displayValue}`)),
          });
          return acc;
        },
        [] as Record<string, MaybeRef<string>>[],
      );
    }),
    tableConfig: (initialTableConfig: ITableConfig) => ({
      disableItemCheckbox: (item?: ISellerProduct | IListEntryBase) => {
        if (item && "type" in item && item.type === "category") {
          return true;
        }
        return false;
      },
      itemActionBuilder: (item: ISellerProduct | IListEntryBase) => {
        if (item && "type" in item && item.type === "category") {
          return [];
        } else {
          return initialTableConfig.itemActionBuilder?.(item);
        }
      },
    }),
  };

  return {
    loading: useLoading(loading, isExporting, listEntriesLoading),
    items: computed(() => items.value),
    query,
    pagination,
    load,
    remove,
    scope,
  };
};
