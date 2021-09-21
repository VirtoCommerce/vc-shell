import { Ref, ref, computed, watch, reactive } from "vue";
import { useLogger, useUser } from "@virtoshell/core";

import {
  ICategory,
  CatalogModuleIndexedSearchClient,
  CategoryIndexedSearchCriteria,
} from "@virtoshell/api-client";

import {
  VcmpSellerCatalogClient,
  ISellerProduct,
  CatalogProduct,
  IProductDetails,
  ProductDetails,
  UpdateProductDetailsCommand,
  CreateNewProductCommand,
} from "../../../../api_client";

interface IUseProduct {
  product: Ref<ISellerProduct>;
  productDetails: IProductDetails;
  loading: Ref<boolean>;
  modified: Ref<boolean>;
  fetchCategories: () => Promise<ICategory[]>;
  loadProduct: (args: { id: string }) => void;
  createProduct: (details: IProductDetails) => void;
  updateProductDetails: (details: IProductDetails) => void;
}

export default (): IUseProduct => {
  const logger = useLogger();
  const product = ref<ISellerProduct>({
    productData: {
      reviews: [],
      images: [],
    } as CatalogProduct,
  });
  const productDetails = reactive<IProductDetails>({});
  let productDetailsCopy: IProductDetails;
  const loading = ref(true);
  const modified = ref(false);

  watch(
    () => productDetails,
    (state) => {
      modified.value =
        JSON.stringify(productDetailsCopy) !== JSON.stringify(state);
    },
    { deep: true }
  );

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function fetchCategories(
    keyword?: string,
    skip = 0
  ): Promise<ICategory[]> {
    const client = await getApiClient();
    const result = await client.searchCategories({
      skip,
      take: 20,
    } as CategoryIndexedSearchCriteria);
    return result.results;
  }

  async function loadProduct(args: { id: string }) {
    logger.info(`Load product page ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      product.value = await client.getProductById(args.id);
      //TODO: use mapping insead this ugly assignments
      Object.assign(productDetails, {
        name: product.value.name,
        images: product.value.productData.images,
        categoryId: product.value.categoryId,
        gtin: product.value.productData.gtin,
        description: product.value.productData?.reviews[0]?.content,
      } as ProductDetails);
      productDetailsCopy = { ...productDetails };
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProductDetails(details: IProductDetails) {
    logger.info(`Update  product details`, details);

    const client = await getApiClient();

    const command = new UpdateProductDetailsCommand({
      sellerProductId: product.value.id,
      productDetails: new ProductDetails(details),
    });

    try {
      loading.value = true;
      await client.updateProductDetails(command);
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
      productData: new ProductDetails(details),
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

  return {
    product: computed(() => product.value),
    modified: computed(() => modified.value),
    productDetails,
    loading: computed(() => loading.value),
    loadProduct,
    updateProductDetails,
    fetchCategories,
    createProduct,
  };
};
