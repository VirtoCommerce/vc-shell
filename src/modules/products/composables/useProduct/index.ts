import { computed, Ref, ref, watch } from "vue";
import { useUser } from "@vc-shell/framework";
import * as _ from "lodash-es";

import {
  CatalogProduct,
  CreateNewProductCommand,
  CreateNewPublicationRequestCommand,
  IProductDetails,
  ISellerProduct,
  ProductDetails,
  PropertyDictionaryItem,
  PropertyDictionaryItemSearchCriteria,
  UpdateProductDetailsCommand,
  SellerProduct,
  ValidateProductQuery,
  VcmpSellerCatalogClient,
  ValidationFailure,
  SearchCategoriesQuery,
  CategorySearchResult,
  EditorialReview,
} from "../../../../api_client/marketplacevendor";

interface IUseProduct {
  product: Ref<ISellerProduct>;
  productDetails: Ref<IProductDetails>;
  loading: Ref<boolean>;
  modified: Ref<boolean>;
  fetchCategories: (keyword?: string, skip?: number, ids?: string[]) => Promise<CategorySearchResult>;
  loadProduct: (args: { id: string }) => void;
  validateProduct: (product: ISellerProduct) => Promise<ValidationFailure[]>;
  createProduct: (details: IProductDetails) => void;
  updateProductDetails: (productId: string, details: IProductDetails, sendToAprove?: boolean) => void;
  revertStagedChanges: (productId: string) => void;
  searchDictionaryItems: (propertyIds: string[], keyword?: string, skip?: number) => Promise<PropertyDictionaryItem[]>;
  deleteProduct: (id: string) => Promise<void>;
  getLanguages: () => Promise<string[]>;
}

export default (): IUseProduct => {
  const product = ref<ISellerProduct>({
    productData: {
      reviews: [],
      images: [],
    } as CatalogProduct,
  });
  const productDetails = ref<IProductDetails>(
    new ProductDetails({
      images: [],
      descriptions: [],
    })
  );
  let productDetailsCopy: IProductDetails;
  const loading = ref(false);
  const modified = ref(false);

  watch(
    () => productDetails,
    (state) => {
      modified.value = !_.isEqual(productDetailsCopy, state.value);
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

  async function fetchCategories(keyword?: string, skip = 0, ids?: string[]): Promise<CategorySearchResult> {
    const client = await getApiClient();
    return await client.searchCategories(
      new SearchCategoriesQuery({
        objectIds: ids,
        keyword,
        skip,
        take: 20,
      })
    );
  }

  async function loadProduct(args: { id: string }) {
    console.info(`Load product page ${args}`);

    const client = await getApiClient();

    try {
      loading.value = true;
      product.value = await client.getProductById(args.id);
      //TODO: use mapping insead this ugly assignments
      productDetails.value = {
        name: product.value.name,
        images: product.value.productData?.images,
        assets: product.value.productData?.assets,
        categoryId: product.value.categoryId,
        gtin: product.value.productData?.gtin,
        properties: product.value.productData?.properties,
        descriptions: product.value.productData?.reviews?.filter((x) => x.reviewType == "QuickReview"),
        productType: product.value.productData?.productType,
      };

      const languages = await client.getAvailableLanguages();
      const notReviewedLangs = languages.filter((x) =>
        productDetails.value.descriptions.every((d) => d.languageCode !== x)
      );
      productDetails.value.descriptions = productDetails.value.descriptions.concat(
        notReviewedLangs.map(
          (x) =>
            new EditorialReview({
              languageCode: x,
              content: "",
              reviewType: "QuickReview",
            })
        )
      );

      productDetailsCopy = _.cloneDeep(productDetails.value);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProductDetails(productId: string, details: IProductDetails, sendToAprove = false) {
    console.info(`Update  product details`, details);

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
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function validateProduct(product: ISellerProduct): Promise<ValidationFailure[]> {
    const client = await getApiClient();

    const query = new ValidateProductQuery({
      sellerProduct: new SellerProduct(product),
    });

    try {
      return await client.validateProduct(query);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function createProduct(details: IProductDetails) {
    console.info(`create new  product`, details);

    const client = await getApiClient();

    const command = new CreateNewProductCommand({
      productDetails: new ProductDetails(details),
    });

    try {
      loading.value = true;
      const newProduct = await client.createNewProduct(command);
      await loadProduct({ id: newProduct.id });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function revertStagedChanges(productId: string) {
    console.info(`revert staged changes for product`, productId);

    const client = await getApiClient();
    try {
      loading.value = true;
      await client.revertStagedChanges(productId);
      await loadProduct({ id: productId });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: string) {
    console.info("delete product", id);

    const client = await getApiClient();
    try {
      loading.value = true;
      await client.deleteProducts([id]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getLanguages() {
    console.info("get languages");
    const client = await getApiClient();
    try {
      return await client.getAvailableLanguages();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  return {
    product: computed(() => product.value),
    productDetails,
    loading: computed(() => loading.value),
    modified: computed(() => modified.value),
    validateProduct,
    loadProduct,
    updateProductDetails,
    fetchCategories,
    createProduct,
    revertStagedChanges,
    searchDictionaryItems,
    deleteProduct,
    getLanguages,
  };
};