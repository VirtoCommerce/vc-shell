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
  SearchProductsResult,
  ISearchProductsResult,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import {
  CatalogModuleListEntryClient,
  CatalogListEntrySearchCriteria,
  ListEntryBase,
  IListEntryBase,
  ICatalogListEntrySearchCriteria,
  ListEntrySearchResult,
  IListEntrySearchResult,
} from "@vcmp-vendor-portal/api/catalog";
import { MaybeRef, ComputedRef, Ref, computed, ref, inject, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";

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
    load: loadWrapper,
    remove: bulkRemoveProducts,
  });

  const { load, remove, items, query, loading, pagination } = listFactory();
  const { openBlade, resolveBladeByName, setNavigationQuery } = useBladeNavigation();
  const { breadcrumbs, push: pushBc, remove: removeBc } = useBreadcrumbs();
  const route = useRoute();
  const isCatalogView = useLocalStorage("VC_APP_PRODUCTS_IS_CATALOG_VIEW", false);

  const isExporting = ref(false);

  const currentSeller = inject("currentSeller", toRef({ id: route?.params?.sellerId })) as Ref<ISeller>;

  const { loading: listEntriesLoading, action: getListEntries } = useAsync(loadListEntries);

  async function loadWrapper(
    q: ISearchProductsQuery | (ICatalogListEntrySearchCriteria & { id?: string }),
  ): Promise<IListEntrySearchResult | ISearchProductsResult> {
    const sellerId = currentSeller.value.id;
    return isCatalogView.value && !args.isWidgetView
      ? await loadCategoryList(q, sellerId)
      : await loadProductsList(q, sellerId);
  }

  async function loadProductsList(q: ISearchProductsQuery, sellerId?: string) {
    const productsQuery = new SearchProductsQuery({ ...(q || {}), sellerId });
    return (await getApiClient()).searchProducts(productsQuery);
  }

  async function loadCategoryList(q: ICatalogListEntrySearchCriteria & { id?: string }, sellerId?: string) {
    if (!q.id && !q.catalogId) setupCatalogBreadcrumbs(sellerId);
    return getListEntries({ ...q, sellerId, query: query.value });
  }

  async function loadListEntries(args?: {
    sellerId?: string;
    id?: string;
    query?: ISearchProductsQuery | ICatalogListEntrySearchCriteria;
  }) {
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
        sellerId,
        stagedProductsIds: sellerId
          ? products.map((x) => x.id).filter((id): id is string => id !== undefined)
          : undefined,
        publishedProductsIds: !sellerId
          ? products.map((x) => x.id).filter((id): id is string => id !== undefined)
          : undefined,
      });
      const sellerProducts = await (await getApiClient()).searchProducts(productsQuery);

      return mapListEntriesWithProducts(listEntries, sellerProducts) as ListEntrySearchResult & SearchProductsResult;
    }

    return listEntries;
  }

  function mapListEntriesWithProducts(listEntries: ListEntrySearchResult, sellerProducts: SearchProductsResult) {
    return {
      results: listEntries.results
        ?.map((x) => (x.type === "product" ? sellerProducts.results?.find((y) => y.stagedProductDataId === x.id) : x))
        .filter(Boolean) as (ISellerProduct | IListEntryBase)[],
      totalCount: listEntries.totalCount,
    };
  }

  async function bulkRemoveProducts(
    query: ((ISearchProductsQuery | ICatalogListEntrySearchCriteria) & { id?: string }) | undefined,
    customQuery: { ids?: string[] | null; allSelected?: boolean },
  ) {
    const command = new BulkProductsDeleteCommand({
      query: new SearchProductsQuery(query),
      productIds: customQuery.ids ?? [],
      all: customQuery.allSelected,
    });
    if (customQuery.allSelected) command.productIds = undefined;
    return (await getApiClient()).bulkDeleteProducts(command);
  }

  function setupCatalogBreadcrumbs(sellerId?: string) {
    pushBc({
      id: sellerId ?? "catalog",
      title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.BREADCRUMBS.CATALOG")),
      clickHandler: async () => {
        await load({ catalogId: sellerId });
      },
    });
  }

  watchEffect(async () => {
    if (args.props.param && isCatalogView.value) {
      await getSingleProduct(args.props.param);
    }
  });

  async function getSingleProduct(id: string) {
    try {
      if (!isCatalogView.value) return;

      const product = await (await getApiClient()).getProductById(id);

      if (!product) {
        console.warn("Product not found:", id);
        return;
      }

      const outlineCategoryIds = product.outline?.split("/") ?? [];
      const outlineCategoryName = product.path?.split("/") ?? [];

      if (outlineCategoryIds.length === 1) {
        await openCategory({
          id: outlineCategoryIds[0],
          name: outlineCategoryName[0],
        });
        return;
      }

      if (outlineCategoryIds.length > 1) {
        await setupCategoryBreadcrumbs(outlineCategoryIds, outlineCategoryName);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }

  async function setupCategoryBreadcrumbs(ids: string[], names: string[]) {
    const lastIndex = ids.length - 1;

    for (let i = 0; i < lastIndex; i++) {
      const id = ids[i];
      const name = names[i];
      pushBc({
        id,
        title: name,
        clickHandler: async () => {
          await load({ ...query.value, id });
        },
      });
    }

    await openCategory({
      id: ids[lastIndex],
      name: names[lastIndex],
    });
  }

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
      options: {
        categoryId: query.value.id,
      },
    });
  }

  async function onListItemClick(args?: TListItemClickArgs) {
    if (isCatalogView.value && args?.item?.type === "category") {
      await openCategory(args.item);
    } else {
      await openBlade({
        blade: resolveBladeByName("Product"),
        param: args?.item?.id,
        onOpen: args?.onOpen,
        onClose: args?.onClose,
      });
    }
  }

  async function openCategory(item: IListEntryBase) {
    if (item.id) {
      pushBc({
        id: item?.id,
        title: item?.name,
        clickHandler: async () => {
          await load({ ...query.value, id: item?.id });
        },
      });

      await load({ ...query.value, id: item?.id });
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
