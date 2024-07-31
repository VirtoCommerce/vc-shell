import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import { CatalogModuleIndexedSearchClient, CatalogProduct } from "@vcmp-vendor-portal/api/catalog";
import {
  SearchProductsQuery,
  SellerProduct,
  ProductAssociation,
  SearchProductAssociationsQuery,
  ProductAssociationSearchResult,
  VcmpSellerCatalogClient,
  ISearchProductAssociationsQuery,
  UpdateProductAssociationsCommand,
  ISeller,
  IProductAssociation,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, inject, ref, toRef } from "vue";
import * as _ from "lodash-es";
import { useRoute } from "vue-router";

const { getApiClient: getAssociationsClient } = useApiClient(VcmpSellerCatalogClient);
const { getApiClient: getProductsClient } = useApiClient(CatalogModuleIndexedSearchClient);

export const useAssociations = () => {
  const route = useRoute();
  const result = ref<ProductAssociationSearchResult>();
  const items = ref<ProductAssociation[]>();
  const totalCount = ref<number | undefined>(0);
  const searchQuery = ref<ISearchProductAssociationsQuery>({});
  const products = ref<CatalogProduct[]>([]);
  const types = ref<string[]>([]);
  const itemId = ref<string | undefined>();
  const currentSeller = inject("currentSeller", toRef({ id: route?.params?.sellerId })) as Ref<ISeller>;

  const { loading: listLoading, action: searchAssociations } = useAsync<ISearchProductAssociationsQuery>(
    async (query) => {
      const apiClient = await getAssociationsClient();
      const searchResult = await apiClient.search(new SearchProductAssociationsQuery(query));
      result.value = searchResult;
      items.value = searchResult.results;
      totalCount.value = searchResult.totalCount;
      itemId.value = query?.objectIds?.[0];

      if (searchResult.results?.length) {
        const ids = searchResult.results.reduce((arr, r) => {
          if (r.associatedObjectId) {
            arr.push(r.associatedObjectId);
          }
          return arr;
        }, [] as string[]);

        if (ids && ids.length) {
          await fetchProductsByIds(ids);
        }
      }
    },
  );

  const { loading: productsLoading, action: fetchProductsByIds } = useAsync<string[]>(async (objectIds) => {
    const apiClient = await getProductsClient();
    const searchResult = await apiClient.searchProducts(
      new SearchProductsQuery({
        objectIds,
        searchFromAllSellers: true,
      }),
    );

    products.value = searchResult.items || [];
  });

  const { loading: removeLoading, action: removeAssociations } = useAsync(
    async (selectedItemsIds: string[] | undefined) => {
      if (selectedItemsIds?.length) {
        await (await getAssociationsClient()).deleteAssociations(selectedItemsIds);
      }
    },
  );

  const { loading: typesLoading, action: getTypes } = useAsync(async () => {
    const apiClient = await getAssociationsClient();

    types.value = await apiClient.getProductAssociationTypes();
  });

  const { loading: addAssociationsLoading, action: addAssociations } = useAsync(
    async (args?: { type: string; selectedItems: (SellerProduct & { quantity: number })[]; itemId: string }) => {
      if (args) {
        await (
          await getAssociationsClient()
        ).updateAssociations(
          new UpdateProductAssociationsCommand({
            associations: args.selectedItems.map(
              (x) =>
                new ProductAssociation({
                  type: args.type,
                  associatedObjectId: x.publishedProductDataId,
                  associatedObjectType: "product",
                  itemId: args.itemId,
                  quantity: x.quantity,
                }),
            ),
            sellerId: currentSeller.value?.id,
            sellerName: currentSeller.value?.name,
          }),
        );
      }
    },
  );

  const associationsByType = computed(() => {
    const associations = items.value || [];

    return types.value.map((type) => ({
      type,
      associations: products.value.reduce(
        (acc, product) => {
          const association = associations.find(
            (assoc) => assoc.type === type && assoc.associatedObjectId === product.id,
          );

          if (association) {
            acc.push({
              ...association,
              publishedProductDataId: product.id,
              name: product.name,
              imgSrc: product.imgSrc,
            });
          }

          return acc;
        },
        [] as (IProductAssociation & {
          publishedProductDataId: string | undefined;
          name: string | undefined;
          imgSrc: string | undefined;
        })[],
      ),
    }));
  });

  return {
    loading: useLoading(listLoading, productsLoading, typesLoading, addAssociationsLoading, removeLoading),
    items: associationsByType,
    totalCount,
    searchAssociations,
    searchQuery,
    getTypes,
    addAssociations,
    removeAssociations,
  };
};
