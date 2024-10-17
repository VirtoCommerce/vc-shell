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
  SellerProductStatus2,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  DetailsComposableArgs,
  UseDetails,
  useDetailsFactory,
  DetailsBaseBladeScope,
  useAssets,
  usePopup,
} from "@vc-shell/framework";
import { ref, computed, reactive, ComputedRef, Ref, watch, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useDynamicProperties, useMultilanguage, useRoles } from "../../../common";
import * as _ from "lodash-es";
import { useMarketplaceSettings } from "../../../settings";
import { useRoute } from "vue-router";
import { defineRule } from "vee-validate";

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
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    remove: IBladeToolbar;
    saveAndSendToApprove: IBladeToolbar;
    revertStagedChanges: IBladeToolbar;
    saveAndPublish: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useProductDetails = (
  args: DetailsComposableArgs<{ options?: { categoryId?: string } }>,
): UseDetails<ISellerProduct & IProductDetails, ProductDetailsScope> => {
  const detailsFactory = useDetailsFactory<ISellerProduct & IProductDetails>({
    load: async (item) => {
      if (item?.id) {
        const resItem = await (await getApiClient()).getProductById(item.id);

        return await createModel(resItem);
      }
    },
    saveChanges: async (details) => {
      const sellerId = await GetSellerId();
      return details.id
        ? (await getApiClient()).updateProductDetails(
            new UpdateProductDetailsCommand({
              sellerId: sellerId,
              sellerProductId: details.id,
              productDetails: new ProductDetails(details),
            }),
          )
        : (await getApiClient()).createNewProduct(
            new CreateNewProductCommand({
              sellerId: sellerId,
              productDetails: new ProductDetails(details),
            }),
          );
    },
    remove: async ({ id }) => (await getApiClient()).deleteProducts([id]),
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { defaultProductType, productTypes, loadSettings } = useMarketplaceSettings();
  const { upload: imageUpload, remove: imageRemove, edit: imageEdit, loading: imageLoading } = useAssets();
  const { getRoles, isAdministrator, isOperator, loading: rolesLoading } = useRoles();
  const { showConfirmation } = usePopup();

  const isGtinValidating = ref(false);

  const { t } = useI18n({ useScope: "global" });

  const disabled = computed(() => !!args.props.param && !item.value?.canBeModified);

  const revertLoading = ref(false);
  const productTypeOptions = ref<IProductType[]>([]);
  const currentCategory = ref<Category>();
  const saveChangesLoading = ref(false);

  const { currentLocale, languages, getLanguages, loading: languagesLoading } = useMultilanguage();
  const route = useRoute();

  // const assetsDisabled = computed(() => disabled.value || item.value.createdBy !== user.value?.userName);

  const declineReasonVisibility = computed(() => !!statusText.value && !item.value?.status?.includes("Published"));
  const statusText = computed(() => {
    if (item.value?.publicationRequests && item.value?.publicationRequests.length) {
      return _.orderBy(item.value.publicationRequests, ["createdDate"], ["desc"])[0].comment ?? "";
    }
    return null;
  });
  const createNewText = computed(() => t("PRODUCTS.PAGES.DETAILS.CREATE_NEW_STATUS_TEXT"));
  const createNewStatusVisibility = computed(() => !item.value?.id);

  const bladeTitle = computed(() =>
    args.props.param && item.value?.name ? item.value?.name : t("PRODUCTS.PAGES.DETAILS.TITLE"),
  );

  defineRule(
    "validateGtin",
    useDebounceFn(async (value: string) => {
      const sellerProduct = {
        ...item.value,
        gtin: value,
      } as ISellerProduct;

      const productErrors = await validateProduct(sellerProduct);
      const errors = productErrors?.filter((error) => error.propertyName?.toLowerCase() === "gtin");

      if (errors.length > 0) {
        return errors
          .map((error) =>
            t(`PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
              value: error?.attemptedValue,
            }),
          )
          .join("\n");
      }

      return true;
    }, 1000),
  );

  const getMappedDetails = reactify((details: (ISellerProduct & IProductDetails) | undefined) => {
    if (details) {
      return reactive({
        ...details,
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
        productType: details.productData?.productType,
        status: details.status,
        sellerId: details.sellerId,
        productData: details.productData,
      }) as ISellerProduct & IProductDetails;
    }
    return details;
  });

  async function loadWrapper(args?: { id: string }) {
    await load(args);
  }

  function createModel(res: ISellerProduct & IProductDetails) {
    if (res) {
      item.value = Object.assign(res, {
        descriptions: res.productData?.reviews?.filter((x) => x.reviewType == "QuickReview"),
      });

      const notReviewedLangs = languages.value.filter((x) =>
        item.value?.descriptions?.every((d) => d.languageCode !== x),
      );
      item.value.descriptions = item.value.descriptions?.concat(
        notReviewedLangs.map(
          (x) =>
            new EditorialReview({
              languageCode: x,
              content: "",
              reviewType: "QuickReview",
            }),
        ),
      );

      const mapped = getMappedDetails(item);

      return mapped.value;
    }
  }

  async function saveChangesWrapper(details?: IProductDetails, sendToApprove = false) {
    try {
      saveChangesLoading.value = true;
      const sellerId = await GetSellerId();
      const savedProduct = (await saveChanges({
        ...details,
        id: item.value?.id,
        sellerId: sellerId,
      })) as unknown as SellerProduct;

      const productId = savedProduct?.id || item.value?.id;
      if (sendToApprove && productId) {
        const newRequestCommand = new CreateNewPublicationRequestCommand({
          sellerId: sellerId,
          productId: productId,
        });
        await (await getApiClient()).createNewPublicationRequest(newRequestCommand);
      }

      if (item.value?.id) {
        await loadWrapper({ id: item.value.id });
      }
    } finally {
      saveChangesLoading.value = false;
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
    const sellerId = await GetSellerId();
    return (await getApiClient()).searchCategories(
      new SearchCategoriesQuery({
        sellerId: sellerId,
        objectIds: ids,
        keyword,
        skip,
        take: 20,
      }),
    );
  }

  async function validateProduct(product: ISellerProduct): Promise<ValidationFailure[]> {
    const client = await getApiClient();

    const query = new ValidateProductQuery({
      sellerProduct: new SellerProduct(product),
    });

    try {
      isGtinValidating.value = true;
      return await client.validateProduct(query);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      isGtinValidating.value = false;
    }
  }

  const setCategory = async (selectedCategory: Category) => {
    if (item.value) {
      currentCategory.value = selectedCategory;
      item.value.categoryId = selectedCategory.id;
      const currentProperties = [...(item.value?.properties || [])];
      item.value.properties = [
        ...(selectedCategory.properties?.map((prop) => new Property({ ...prop, isReadOnly: false })) || []),
      ];
      item.value.properties.forEach((property) => {
        const previousPropertyValue = currentProperties?.find((item) => item.id === property.id);
        if (previousPropertyValue) {
          property.values = previousPropertyValue.values?.map((item) => new PropertyValue(item));
        }
      });
    }
  };

  const validateGtin = useDebounceFn(async (value: string, property) => {
    const sellerProduct = {
      ...item.value,
      gtin: value,
    } as ISellerProduct;
    const productErrors = await validateProduct(sellerProduct);
    const errors = productErrors?.filter((error) => error.propertyName?.toLowerCase() === "gtin");
    validationState.value.setFieldError(
      property,
      errors
        .map((error) =>
          t(`PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
            value: error?.attemptedValue,
          }),
        )
        .concat(validationState.value.errorBag[property] ?? [])
        .join("\n"),
    );
  }, 1000);

  defineRule(
    "validateGtin",
    (function () {
      let timeout: ReturnType<typeof setTimeout> | null;
      let lastValue = "";

      return (value: string, _, context) => {
        if (value === lastValue) {
          return validationState.value.errorBag[context.name]?.join("\n") || true;
        }

        lastValue = value;

        if (timeout) {
          clearTimeout(timeout);
        }

        // Immediately set the error message to "Checking..."
        validationState.value.setFieldError(context.name, t("PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.VALIDATION.CHECKING"));

        timeout = setTimeout(async () => {
          try {
            const sellerProduct = {
              ...item.value,
              gtin: value,
            } as ISellerProduct;

            const productErrors = await validateProduct(sellerProduct);

            const errors = productErrors?.filter((error) => error.propertyName?.toLowerCase() === "gtin");

            if (errors && errors.length > 0) {
              const messages = errors.map((error) =>
                t(`PRODUCTS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
                  value: error?.attemptedValue,
                }),
              );

              validationState.value.setFieldError(context.name, messages.join("\n"));
            } else {
              validationState.value.setFieldError(context.name, "");
            }
          } catch (e) {
            validationState.value.setFieldError(context.name, "An error occurred during validation");
          }
        }, 1000);

        return t("PRODUCTS.PAGES.DETAILS.FIELDS.GTIN.VALIDATION.CHECKING");
      };
    })(),
  );

  const scope: ProductDetailsScope = {
    disabled,
    fetchCategories,
    productTypeOptions,
    setCategory,
    declineReasonVisibility,
    statusText,
    createNewText,
    createNewStatusVisibility,
    markProductDirty,
    isGtinValidating,
    propertiesCardVisibility: computed(() => !!item.value?.id || !!currentCategory.value),
    galleryVisibility: computed(() => !!item.value?.categoryId),
    productTypeDisabled: computed(() => !!item.value?.id),
    toolbarOverrides: {
      saveChanges: {
        async clickHandler() {
          if (item.value) {
            const res = await saveChanges(item.value);

            if (item.value?.id) {
              await loadWrapper({ id: item.value.id });
            }

            args.emit("parent:call", {
              method: "reload",
            });

            args.emit("parent:call", {
              method: "updateActiveWidgetCount",
            });

            if (!unref(args.props.param)) {
              args.emit("parent:call", {
                method: "openDetailsBlade",
                args: {
                  param: (res && res.id) ?? undefined,
                },
              });
            }
          }
        },
        isVisible: computed(() => !rolesLoading.value && !(isAdministrator.value || isOperator.value)),
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
        isVisible: computed(
          () => !!args.props.param && !rolesLoading.value && !(isAdministrator.value || isOperator.value),
        ),
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
            !(item.value?.canBeModified && (item.value?.hasStagedChanges || validationState.value.modified)),
        ),
      },
      revertStagedChanges: {
        isVisible: computed(
          () => !!args.props.param && !rolesLoading.value && !(isAdministrator.value || isOperator.value),
        ),
        async clickHandler() {
          if (await showConfirmation(t("PRODUCTS.PAGES.ALERTS.REVERT_CONFIRMATION"))) {
            await revertStagedChanges(item.value?.id ?? "");
            args.emit("parent:call", {
              method: "reload",
            });
          }
        },
        disabled: computed(
          () => !(item.value?.isPublished && item.value?.hasStagedChanges && item.value?.canBeModified),
        ),
      },
      saveAndPublish: {
        isVisible: computed(() => !rolesLoading.value && (isAdministrator.value || isOperator.value)),
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
            (!validationState.value.modified &&
              !(
                item.value?.status == SellerProductStatus2.HasStagedChanges ||
                item.value?.status == SellerProductStatus2.WaitForApproval ||
                item.value?.status == SellerProductStatus2.None
              )) ||
            !validationState.value.valid ||
            (args.props.param && !(item.value?.canBeModified || validationState.value.modified)) ||
            (!args.props.param && !validationState.value.modified),
        ),
      },
    },
    dynamicProperties: useDynamicProperties(),
    multilanguage: useMultilanguage(),
    assetsHandler: {
      images: {
        loading: imageLoading,
        async upload(files, startingSortOrder) {
          return (await imageUpload(files, `products/${item.value?.id}`, startingSortOrder)).map((x) => new Image(x));
        },
        remove(files) {
          return imageRemove(files, item.value?.images ?? []);
        },
        edit(files) {
          return imageEdit(files, item.value?.images ?? []).map((x) => new Image(x));
        },
      },
    },
    computedDescription: computed({
      get() {
        return useArrayFind(item.value?.descriptions ?? [], (x) => x.languageCode == currentLocale.value).value
          ?.content;
      },
      set(value) {
        const foundItem = useArrayFind(
          item.value?.descriptions ?? [],
          (x) => x.languageCode == currentLocale.value,
        ).value;
        if (foundItem) {
          foundItem.content = value;
        }
      },
    }),
  };

  watch(
    () => args?.mounted.value,
    async () => {
      await getRoles();
      await getLanguages();
      await loadSettings();

      productTypeOptions.value = productTypes.value?.map((x) => ({
        label: t(`PRODUCTS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.${x}`, x),
        value: x,
      }));

      if (!args.props.param) {
        item.value = reactive(new SellerProduct());

        item.value = Object.assign(item.value, { descriptions: [] });

        item.value.descriptions = item.value.descriptions?.concat(
          languages.value.map(
            (x) =>
              new EditorialReview({
                languageCode: x,
                content: "",
                reviewType: "QuickReview",
              }),
          ),
        );

        item.value.productData = new ProductDetails({ productType: defaultProductType.value });

        validationState.value.resetModified(getMappedDetails(item), true);
      }
    },
  );

  watch(
    [() => item.value, () => args.props.options?.categoryId],
    async ([newItem, newVal]) => {
      if (newItem && newVal && item.value) {
        item.value.categoryId = newVal;

        currentCategory.value = await fetchCategories(undefined, 0, [newVal]);
      }
    },
    { immediate: true },
  );

  async function markProductDirty() {
    if (item.value) {
      item.value.hasStagedChanges = true;
      await saveChangesWrapper({ ...item.value }, false);
    }
  }

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load: loadWrapper,
    saveChanges: saveChangesWrapper,
    remove,
    scope,
    item,
    validationState,
    loading: useLoading(loading, revertLoading, languagesLoading, rolesLoading, saveChangesLoading),
    bladeTitle,
  };
};
