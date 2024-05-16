import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  useUser,
  UseDetails,
  DynamicBladeForm,
  useDetailsFactory,
  DetailsBaseBladeScope,
  useAssets,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  IOffer,
  Offer,
  CreateNewOfferCommand,
  OfferDetails,
  UpdateOfferCommand,
  SearchProductsForNewOfferQuery,
  InventoryInfo,
  OfferPrice,
  SearchOfferProductsResult,
  Image,
  SellerProduct,
  IOfferPrice,
  ChangeOfferDefaultCommand,
  ValidateOfferQuery,
  ValidationFailure,
  OfferPriceList,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, nextTick, reactive, ref, watch, ComputedRef } from "vue";
import { useMarketplaceSettings } from "../../../settings";
import { useI18n } from "vue-i18n";
import { ICurrency } from "../../../settings/composables/useMarketplaceSettings";
import { useDynamicProperties, useMultilanguage } from "../../../common";
import { useFulfillmentCenters } from "../../../fulfillment-centers/composables";
import { useRoute } from "vue-router";
import { useDebounceFn } from "@vueuse/core";

export interface IProductType {
  label: string;
  value: string;
}

export interface OfferDetailsScope extends DetailsBaseBladeScope {
  fetchProducts: (keyword?: string, skip?: number, ids?: string[]) => Promise<SearchOfferProductsResult>;
  getProductItem: () => void;
  trackInventoryFn: () => boolean;
  productTypeOptions: Ref<IProductType[]>;
  productTypeDisabled: ComputedRef<boolean>;
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    enable: IBladeToolbar;
    disable: IBladeToolbar;
    setDefault: IBladeToolbar;
    remove: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useOfferDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"] & { options: { sellerProduct: SellerProduct } };
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<IOffer, OfferDetailsScope> => {
  const { user } = useUser();
  const { t } = useI18n({ useScope: "global" });
  const offerLoading = ref(false);
  const productLoading = ref(false);
  const alreadyDefault = ref(false);
  const productTypeOptions = ref<IProductType[]>([]);
  const { items: fulfillmentCentersList, load: searchFulfillmentCenters } = useFulfillmentCenters();
  const route = useRoute();

  const { settingUseDefaultOffer, productTypes, loadSettings } = useMarketplaceSettings();
  const { getLanguages, loading: languagesLoading } = useMultilanguage();
  const { upload: imageUpload, remove: imageRemove, edit: imageEdit, loading: imageLoading } = useAssets();

  const detailsFactory = useDetailsFactory<IOffer>({
    load: async (item) => {
      if (item?.id) {
        return (await getApiClient()).getOfferByIdGET(item.id);
      }
    },
    saveChanges: async (details) => {
      const sellerId = await GetSellerId();
      return details.id
        ? (await getApiClient()).updateOffer(
            new UpdateOfferCommand({
              sellerId: sellerId,
              sellerName: user.value?.userName,
              offerId: details.id,
              offerDetails: new OfferDetails({ ...details, sku: details.sku ?? "" }),
            }),
          )
        : (await getApiClient()).createNewOffer(
            new CreateNewOfferCommand({
              sellerId: sellerId,
              sellerName: user.value?.userName,
              productId: details.productId,
              details: new OfferDetails({ ...details, sku: details.sku ?? "" }),
            }),
          );
    },
    remove: async ({ id }) => (await getApiClient()).deleteOffers([id]),
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();

  const bladeTitle = computed(() => {
    return args.props.param
      ? item.value?.name
        ? item.value.name + " " + t("OFFERS.PAGES.DETAILS.OFFER_DETAILS")
        : ""
      : t("OFFERS.PAGES.DETAILS.TITLE");
  });

  const fetchProducts = async (keyword?: string, skip?: number, ids?: string[]) => {
    const sellerId = await GetSellerId();
    return await (
      await getApiClient()
    ).searchOfferProducts(
      new SearchProductsForNewOfferQuery({
        sellerId: sellerId,
        objectIds: ids,
        keyword: keyword,
        skip: skip || 0,
        take: 20,
      }),
    );
  };

  watch(
    () => item.value?.inventory,
    () => {
      item.value?.inventory?.forEach((x) => {
        if (!x.inStockQuantity) {
          x.inStockQuantity = 0;
        }
      });
    },
    { deep: true },
  );

  const addEmptyInventory = async () => {
    if (item.value) {
      item.value.inventory = [];
      await searchFulfillmentCenters({});
      fulfillmentCentersList.value.forEach((x) => {
        const inventoryInfo = new InventoryInfo();
        inventoryInfo.id = x.name;
        inventoryInfo.fulfillmentCenter = x;
        inventoryInfo.fulfillmentCenterId = x.id;
        inventoryInfo.fulfillmentCenterName = x.name;
        inventoryInfo.inStockQuantity = 0;
        inventoryInfo.createdDate = new Date();
        item.value?.inventory?.push(inventoryInfo);
      });
    }
  };

  function generateSku(): string {
    // XXX(letter)-XXXXXXXX(number).
    const letterPart = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digitPart = "1234567890";
    let result = "";
    for (let i = 0; i < 3; i++) {
      result += letterPart[Math.floor(Math.random() * letterPart.length)];
    }
    result += "-";
    for (let i = 0; i < 8; i++) {
      result += digitPart[Math.floor(Math.random() * digitPart.length)];
    }
    return result;
  }

  async function setProductItem(id: string) {
    try {
      productLoading.value = true;
      const fetchedProduct = (await fetchProducts(undefined, 0, [id])).results;

      if (fetchedProduct && fetchedProduct.length && item.value) {
        const currentProduct = fetchedProduct[0];

        if (!item.value?.id) {
          item.value.productType = currentProduct.productType;

          item.value.properties =
            currentProduct.properties?.map((x) => {
              if (x.type === "Variation") {
                x.values = [];
              }
              return x;
            }) ?? [];
        }

        if (args.props.options && "sellerProduct" in args.props.options && args.props.options.sellerProduct) {
          item.value.productId = currentProduct.id;
        }
      }
    } finally {
      productLoading.value = false;
    }
  }

  function getProductItem() {
    if (item.value?.productId) {
      setProductItem(item.value.productId);
    }
  }

  function trackInventoryFn() {
    return !item.value?.trackInventory;
  }

  watch(
    () => args?.mounted.value,
    async () => {
      try {
        offerLoading.value = true;
        alreadyDefault.value = false;
        await getLanguages();
        await loadSettings();

        productTypeOptions.value = productTypes.value?.map((x) => ({
          label: t(`OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.${x}`, x),
          value: x,
        }));

        if (!args.props.param) {
          item.value = reactive(new Offer());
          item.value.trackInventory = true;
          item.value.sku = generateSku();
          await addEmptyInventory();
        }

        const resolveId = (value: keyof Pick<SellerProduct, "publishedProductDataId" | "stagedProductDataId">) =>
          args.props?.options?.sellerProduct?.[value];

        const searchableProductId =
          item.value?.productId || resolveId("publishedProductDataId") || resolveId("stagedProductDataId");
        if (searchableProductId) {
          await setProductItem(searchableProductId);
        }
      } finally {
        offerLoading.value = false;
        validationState.value.resetModified(item.value!, true);
      }
    },
  );

  async function validateOffer(offer: IOffer): Promise<ValidationFailure[]> {
    const client = await getApiClient();

    const query = new ValidateOfferQuery({
      offer: new Offer(offer),
    });

    try {
      return await client.validateOffer(query);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const validateSku = useDebounceFn(async (value: string, property) => {
    const offer = {
      ...item.value,
      sku: value,
    } as IOffer;
    const offerErrors = await validateOffer(offer);
    const errors = offerErrors?.filter((error) => error.propertyName?.toLowerCase() === "sku");
    validationState.value.setFieldError(
      property,
      errors
        .map((error) =>
          t(`OFFERS.PAGES.DETAILS.ERRORS.${error?.errorCode}`, {
            value: error?.attemptedValue,
          }),
        )
        .concat(validationState.value.errorBag[property] ?? [])
        .join("\n"),
    );
  }, 1000);

  const scope = ref<OfferDetailsScope>({
    fetchProducts,
    getProductItem,
    trackInventoryFn,
    validateSku,
    disableProductSelect: computed(() => !!args.props.param),
    productTypeOptions,
    productTypeDisabled: computed(() => !!item.value?.id),
    saveSpecialPrices: (data: { items: OfferPriceList[] }) => {
      if (item.value) {
        Object.assign(item.value, { priceLists: data.items });
      }
    },
    toolbarOverrides: {
      saveChanges: {
        disabled: computed(() => {
          return !(validationState.value.valid && validationState.value.modified);
        }),
      },
      enable: {
        async clickHandler() {
          if (item.value?.id) {
            item.value.isActive = true;
          }
        },
        isVisible: computed(() => (args.props.param ? !item.value?.isActive : false)),
      },
      disable: {
        async clickHandler() {
          if (item.value?.id) {
            item.value.isActive = false;
          }
        },
        isVisible: computed(() => (args.props.param ? item.value?.isActive : false)),
      },
      remove: {
        isVisible: computed(() => !!args.props.param),
      },
      setDefault: {
        async clickHandler() {
          offerLoading.value = true;
          if (item.value?.id) {
            const command = new ChangeOfferDefaultCommand({
              offerId: item.value?.id,
              isDefault: true,
            });
            await (await getApiClient()).changeOfferDefault(command);
            args.emit("parent:call", {
              method: "reload",
            });
            alreadyDefault.value = true;
            offerLoading.value = false;
          }
        },
        disabled: computed(() => item.value?.isDefault || alreadyDefault.value),
        isVisible: computed(() => (args.props.param ? settingUseDefaultOffer.value : false)),
      },
    },
    dynamicProperties: useDynamicProperties(),
    multilanguage: useMultilanguage(),
    assetsHandler: {
      images: {
        loading: imageLoading,
        async upload(files, startingSortOrder) {
          return (await imageUpload(files, `offers/${item.value?.id}`, startingSortOrder)).map((x) => new Image(x));
        },
        remove(files) {
          return imageRemove(files, item.value?.images ?? []);
        },
        edit(files) {
          return imageEdit(files, item.value?.images ?? []).map((x) => new Image(x));
        },
      },
    },
  });

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    remove,
    saveChanges,
    scope: computed(() => scope.value),
    loading: useLoading(loading, offerLoading, productLoading, languagesLoading),
    item,
    validationState,
    bladeTitle,
  };
};
