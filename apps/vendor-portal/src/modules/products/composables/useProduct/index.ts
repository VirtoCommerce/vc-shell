import { computed, reactive, Ref, ref, watch } from "vue";
import { useLogger, useUser } from "@virtoshell/core";
import { cloneDeep as _cloneDeep, isEqual } from "lodash-es";

import { CategoryIndexedSearchCriteria } from "../../../../api_client/catalog";

import {
  CatalogProduct,
  CategorySearchResult,
  CreateNewProductCommand,
  CreateNewPublicationRequestCommand,
  IProductDetails,
  ISellerProduct,
  ProductDetails,
  PropertyDictionaryItem,
  PropertyDictionaryItemSearchCriteria,
  UpdateProductDetailsCommand,
  VcmpSellerCatalogClient,
} from "../../../../api_client/marketplacevendor";

interface IUseProduct {
  product: Ref<ISellerProduct>;
  productDetails: Ref<IProductDetails>;
  loading: Ref<boolean>;
  modified: Ref<boolean>;
  fetchCategories: (
    keyword?: string,
    skip?: number,
    ids?: string[]
  ) => Promise<CategorySearchResult>;
  loadProduct: (args: { id: string }) => void;
  createProduct: (details: IProductDetails) => void;
  updateProductDetails: (
    productId: string,
    details: IProductDetails,
    sendToAprove?: boolean
  ) => void;
  revertStagedChanges: (productId: string) => void;
  searchDictionaryItems: (
    propertyIds: string[],
    keyword?: string,
    skip?: number
  ) => Promise<PropertyDictionaryItem[]>;
}

export default (): IUseProduct => {
  const logger = useLogger();
  const product = ref<ISellerProduct>({
    productData: {
      reviews: [],
      images: [],
    } as CatalogProduct,
  });
  const productDetails = ref<IProductDetails>(
    new ProductDetails({
      images: [],
    })
  );
  let productDetailsCopy: IProductDetails;
  const loading = ref(false);
  const modified = ref(false);

  watch(
    () => productDetails,
    (state) => {
      modified.value = !isEqual(productDetailsCopy, state.value);
    },
    { deep: true }
  );

  async function searchDictionaryItems(
    propertyIds: string[],
    keyword?: string,
    skip?: number
  ): Promise<PropertyDictionaryItem[]> {
    const client = await getApiClient();
    const result = await client.searchPropertyDictionaryItems({
      propertyIds,
      keyword,
      skip,
      take: 20,
    } as PropertyDictionaryItemSearchCriteria);
    return result.results;
  }

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchCategories(
    keyword?: string,
    skip = 0,
    ids?: string[]
  ): Promise<CategorySearchResult> {
    const client = await getApiClient();
    return await client.searchCategories({
      objectIds: ids,
      keyword,
      skip,
      take: 20,
    } as CategoryIndexedSearchCriteria);
  }

  async function loadProduct(args: { id: string }) {
    logger.info(`Load product page ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      product.value = await client.getProductById(args.id);
      //TODO: use mapping insead this ugly assignments
      productDetails.value = {
        name: product.value.name,
        images: product.value.productData?.images,
        categoryId: product.value.categoryId,
        gtin: product.value.productData?.gtin,
        properties: product.value.productData?.properties,
        description: product.value.productData?.reviews[0]?.content,
      };
      productDetailsCopy = _cloneDeep(productDetails.value);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProductDetails(
    productId: string,
    details: IProductDetails,
    sendToAprove = false
  ) {
    logger.info(`Update  product details`, details);

    const client = await getApiClient();

    const command = new UpdateProductDetailsCommand({
      sellerProductId: productId,
      productDetails: new ProductDetails(details),
    });

    try {
      loading.value = true;
      await client.updateProductDetails(command);
      if (sendToAprove) {
        const newRequestCommand = new CreateNewPublicationRequestCommand({
          productId,
        });
        await client.createNewPublicationRequest(newRequestCommand);
      }
      await loadProduct({ id: product.value.id });
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(details: IProductDetails) {
    logger.info(`create new  product`, details);

    const client = await getApiClient();

    const command = new CreateNewProductCommand({
      productDetails: new ProductDetails(details),
    });

    try {
      loading.value = true;
      const newProduct = await client.createNewProduct(command);
      await loadProduct({ id: newProduct.id });
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function revertStagedChanges(productId: string) {
    logger.info(`revert staged changes for product`, productId);

    const client = await getApiClient();
    try {
      loading.value = true;
      await client.revertStagedChanges(productId);
      await loadProduct({ id: productId });
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    product: computed(() => product.value),
    modified: computed(() => modified.value),
    productDetails,
    loading: computed(() => loading.value),
    loadProduct,
    updateProductDetails,
    fetchCategories,
    createProduct,
    revertStagedChanges,
    searchDictionaryItems,
  };
};
