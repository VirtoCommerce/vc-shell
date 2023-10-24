import { reactify, useArrayFind, useDebounceFn } from "@vueuse/core";
import {
  CategorySearchResult,
  CreateNewProductCommand,
  ProductDetails,
  SearchCategoriesQuery,
  ISellerProduct,
  UpdateProductDetailsCommand,
  VcmpSellerCatalogClient,
  IProductDetails,
  EditorialReview,
  CreateNewPublicationRequestCommand,
  SellerProduct,
  Category,
  Property,
  PropertyValue,
  Image,
  ValidateProductQuery,
  ValidationFailure,
} from "vcmp-vendor-portal-api/marketplacevendor";
import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  DynamicBladeForm,
  UseDetails,
  useDetailsFactory,
  DetailsBaseBladeScope,
} from "@vc-shell/framework";
import { ref, computed, reactive, onMounted, ComputedRef, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { useDynamicProperties, useMultilanguage, useAssets } from "../../../common";
import * as _ from "lodash-es";
import { useMarketplaceSettings } from "../../../settings";

export interface IProductType {
  label: string;
  value: string;
}

export interface ProductDetailsScope extends DetailsBaseBladeScope {
  fetchCategories: (keyword?: string, skip?: number, ids?: string[]) => Promise<CategorySearchResult>;
  productTypeOptions: Ref<IProductType[]>;
  galleryVisibility: ComputedRef<boolean>;
  productTypeDisabled: ComputedRef<boolean>;
  propertiesCardVisibility: ComputedRef<boolean>;
  statusText: ComputedRef<string | null>;
  setCategory: (selectedCategory: Category) => Promise<void>;
  assetsHandler: { images: ReturnType<typeof useAssets> };
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    remove: IBladeToolbar;
    saveAndSendToApprove: IBladeToolbar;
    revertStagedChanges: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useProductDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}): UseDetails<ISellerProduct & IProductDetails, ProductDetailsScope> => {
  const detailsFactory = useDetailsFactory<ISellerProduct & IProductDetails>({
    load: async ({ id }) => (await getApiClient()).getProductById(id),
    saveChanges: async (details) => {
      return details.id
        ? (await getApiClient()).updateProductDetails(
            new UpdateProductDetailsCommand({
              sellerProductId: details.id,
              productDetails: new ProductDetails(details),
            })
          )
        : (await getApiClient()).createNewProduct(
            new CreateNewProductCommand({ productDetails: new ProductDetails(details) })
          );
    },
    remove: async ({ id }) => (await getApiClient()).deleteProducts([id]),
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { defaultProductType, productTypes, loadSettings } = useMarketplaceSettings();

  const { t } = useI18n({ useScope: "global" });

  const disabled = computed(() => args.props.param && !item.value?.canBeModified);

  const revertLoading = ref(false);
  const productTypeOptions = ref<IProductType[]>([]);
  const currentCategory = ref<Category>();

  const { currentLocale, languages, getLanguages, loading: languagesLoading } = useMultilanguage();

  // const assetsDisabled = computed(() => disabled.value || item.value.createdBy !== user.value?.userName);

  const declineReasonVisibility = computed(() => statusText.value && item.value?.status !== "Published");
  const statusText = computed(() => {
    if (item.value?.publicationRequests && item.value?.publicationRequests.length) {
      return _.orderBy(item.value.publicationRequests, ["createdDate"], ["desc"])[0].comment;
    }
    return null;
  });

  const bladeTitle = computed(() => (args.props.param ? item.value?.name : t("PRODUCTS.PAGES.DETAILS.TITLE")));

  const getMappedDetails = reactify((details: ISellerProduct & IProductDetails) => {
    if (details) {
      return reactive({
        publicationRequests: details.publicationRequests,
        canBeModified: details.canBeModified,
        createdBy: "createdBy" in details && details.createdBy,
        hasStagedChanges: details.hasStagedChanges,
        isPublished: details.isPublished,
        id: details.id,
        name: details.name,
        images: details.productData?.images,
        assets: details.productData?.assets,
        categoryId: details.categoryId,
        gtin: details.productData?.gtin,
        properties: details.productData?.properties,
        descriptions: details.descriptions,
        publishedProductDataId: details.publishedProductDataId,
        stagedProductDataId: details.stagedProductDataId,
        description: computed({
          get() {
            return useArrayFind(details.descriptions, (x) => x.languageCode == currentLocale.value).value.content;
          },
          set(value) {
            useArrayFind(details.descriptions, (x) => x.languageCode == currentLocale.value).value.content = value;
          },
        }),
        productType: details.productData?.productType,
        status: details.status,
      });
    }
  });

  async function loadWrapper(args: { id: string }) {
    await load(args);

    if (item.value) {
      item.value = Object.assign(item.value, {
        descriptions: item.value.productData?.reviews?.filter((x) => x.reviewType == "QuickReview"),
      });

      const notReviewedLangs = languages.value.filter((x) =>
        item.value.descriptions?.every((d) => d.languageCode !== x)
      );
      item.value.descriptions = item.value.descriptions?.concat(
        notReviewedLangs.map(
          (x) =>
            new EditorialReview({
              languageCode: x,
              content: "",
              reviewType: "QuickReview",
            })
        )
      );

      const mapped = getMappedDetails(item);

      validationState.value.resetModified(mapped, true);
    }
  }

  async function saveChangesWrapper(details: IProductDetails, sendToApprove = false) {
    await saveChanges({ ...details, id: item.value?.id });

    if (sendToApprove) {
      const newRequestCommand = new CreateNewPublicationRequestCommand({
        productId: item.value?.id,
      });
      await (await getApiClient()).createNewPublicationRequest(newRequestCommand);
    }

    if (item.value?.id) {
      await loadWrapper({ id: item.value.id });
    }
  }

  async function revertStagedChanges(productId: string) {
    console.info(`revert staged changes for product`, productId);
    try {
      revertLoading.value = true;
      await (await getApiClient()).revertStagedChanges(productId);
      await loadWrapper({ id: productId });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      revertLoading.value = false;
    }
  }

  async function fetchCategories(keyword?: string, skip = 0, ids?: string[]): Promise<CategorySearchResult> {
    return (await getApiClient()).searchCategories(
      new SearchCategoriesQuery({
        objectIds: ids,
        keyword,
        skip,
        take: 20,
      })
    );
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

  const setCategory = async (selectedCategory: Category) => {
    currentCategory.value = selectedCategory;
    item.value.categoryId = selectedCategory.id;
    const currentProperties = [...(item.value?.properties || [])];
    item.value.properties = [
      ...(selectedCategory.properties?.map((prop) => new Property({ ...prop, isReadOnly: false })) || []),
    ];
    item.value.properties.forEach((property) => {
      const previousPropertyValue = currentProperties?.find((item) => item.id === property.id);
      if (previousPropertyValue) {
        property.values = previousPropertyValue.values.map((item) => new PropertyValue(item));
      }
    });
  };

  const validateGtin = useDebounceFn(async (value: string, property, context) => {
    const sellerProduct = {
      ...item.value,
      gtin: value,
    } as ISellerProduct;
    const productErrors = await validateProduct(sellerProduct);
    const errors = productErrors?.filter((error) => error.propertyName.toLowerCase() === "gtin");
    validationState.value.setFieldError(
      property,
      errors
        .map((error) =>
          t(`PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
            value: error?.attemptedValue,
          })
        )
        .join("\n")
    );
  }, 1000);

  const scope = ref<ProductDetailsScope>({
    disabled,
    fetchCategories,
    productTypeOptions,
    validateGtin,
    setCategory,
    declineReasonVisibility,
    statusText,
    propertiesCardVisibility: computed(() => !!item.value?.id || !!currentCategory.value),
    galleryVisibility: computed(() => !!item.value?.categoryId),
    productTypeDisabled: computed(() => !!item.value?.id),
    toolbarOverrides: {
      saveChanges: {
        disabled: computed(() => {
          return (
            !validationState.value.modified ||
            !validationState.value.valid ||
            (args.props.param && !(item.value?.canBeModified || validationState.value.modified)) ||
            (!args.props.param && !validationState.value.modified)
          );
        }),
      },
      remove: {
        isVisible: computed(() => !!args.props.param && !loading.value),
      },
      saveAndSendToApprove: {
        isVisible: computed(() => !!args.props.param),
        async clickHandler() {
          await saveChangesWrapper({ ...item.value }, true);

          args.emit("parent:call", {
            method: "reload",
          });
          if (!args.props.param) {
            args.emit("close:blade");
          }
        },
        disabled: computed(
          () =>
            !validationState.value.valid ||
            !(item.value?.canBeModified && (item.value?.hasStagedChanges || validationState.value.modified))
        ),
      },
      revertStagedChanges: {
        isVisible: computed(() => !!args.props.param),
        async clickHandler() {
          await revertStagedChanges(item.value.id);
          args.emit("parent:call", {
            method: "reload",
          });
        },
        disabled: computed(
          () => !(item.value?.isPublished && item.value?.hasStagedChanges && item.value?.canBeModified)
        ),
      },
    },
    dynamicProperties: useDynamicProperties(),
    multilanguage: useMultilanguage(),
    assetsHandler: {
      images: useAssets(Image),
    },
  });

  onMounted(async () => {
    await getLanguages();
    await loadSettings();

    productTypeOptions.value = productTypes.value?.map((x) => ({
      label: t(`PRODUCTS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.${x}`, x),
      value: x,
    }));

    if (!args.props.param) {
      item.value = reactive(new SellerProduct());

      item.value = Object.assign(item.value, { descriptions: [] });

      item.value.descriptions = item.value.descriptions.concat(
        languages.value.map(
          (x) =>
            new EditorialReview({
              languageCode: x,
              content: "",
              reviewType: "QuickReview",
            })
        )
      );

      item.value.productData = new ProductDetails({ productType: defaultProductType.value });

      validationState.value.resetModified(getMappedDetails(item), true);
    }
  });

  return {
    load: loadWrapper,
    saveChanges: saveChangesWrapper,
    remove,
    scope: computed(() => scope.value),
    item,
    validationState,
    loading: useLoading(loading, revertLoading, languagesLoading),
    bladeTitle,
  };
};
