import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import { CatalogModuleIndexedSearchClient, CatalogProduct } from "@vcmp-vendor-portal/api/catalog";
import {
  SearchProductsQuery,
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

export interface IUseAssociations {
  items: Ref<{ type: string; associations: IProductAssociation[] }[]>;
  totalCount: Ref<number | undefined>;
  searchAssociations: (query: ISearchProductAssociationsQuery) => Promise<void>;
  searchQuery: Ref<ISearchProductAssociationsQuery>;
  getTypes: () => Promise<void>;
  createAssociations: (args: {
    type: string;
    items: { quantity: number | undefined; publishedProductDataId: string | undefined }[];
    itemId: string;
  }) => ProductAssociation[];
  removeAssociations: (selectedItemsIds: string[] | undefined) => Promise<void>;
  saveAssociations: (associations: ProductAssociation[]) => Promise<void>;
  loading: Ref<boolean>;
}

export const useAssociations = (): IUseAssociations => {
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

  const { loading: addAssociationsLoading, action: saveAssociations } = useAsync<ProductAssociation[]>(
    async (associations) => {
      if (associations?.length) {
        await (
          await getAssociationsClient()
        ).updateAssociations(
          new UpdateProductAssociationsCommand({
            associations,
            sellerId: currentSeller.value?.id,
            sellerName: currentSeller.value?.name,
          }),
        );
      }
    },
  );

  function createAssociations(args: {
    type: string;
    items: { quantity: number | undefined; publishedProductDataId: string | undefined }[];
    itemId: string;
  }) {
    return args.items.map(
      (x) =>
        new ProductAssociation({
          type: args.type,
          associatedObjectId: x.publishedProductDataId,
          associatedObjectType: "product",
          itemId: args.itemId,
          quantity: x.quantity,
          id: items.value?.find((i) => i.type === args.type && i.associatedObjectId === x.publishedProductDataId)?.id,
        }),
    );
  }

  const associationsByType = computed(() => {
    const associations = items.value || [];

    return types.value.map((type) => ({
      type,
      associations: associations
        .map((a) => {
          if (a.type === type) {
            const product = products.value?.find((p) => p.id === a.associatedObjectId);

            return {
              ...a,
              publishedProductDataId: product?.id,
              name: product?.name,
              imgSrc: product?.imgSrc,
            };
          }
          return null;
        })
        .filter((a) => a !== null) as IProductAssociation[],
    }));
  });

  return {
    loading: useLoading(listLoading, productsLoading, typesLoading, addAssociationsLoading, removeLoading),
    items: associationsByType,
    totalCount,
    searchAssociations,
    searchQuery,
    getTypes,
    createAssociations,
    removeAssociations,
    saveAssociations,
  };
};
