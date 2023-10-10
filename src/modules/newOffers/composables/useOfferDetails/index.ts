import {
  IBladeToolbar,
  useApiClient,
  useLoading,
  useUser,
  UseDetails,
  DynamicBladeForm,
  useDetailsFactory,
  DetailsBaseBladeScope,
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
} from "../../../../api_client/marketplacevendor";
import { Ref, computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useFulfillmentCenters, useMarketplaceSettings } from "../../../settings";
import { useI18n } from "vue-i18n";
import { ICurrency } from "../../../settings/composables/useMarketplaceSettings";
import * as _ from "lodash-es";
import { useAssets, useDynamicProperties, useMultilanguage } from "../../../common";

export interface OfferDetailsScope extends DetailsBaseBladeScope {
  fetchProducts: (keyword?: string, skip?: number, ids?: string[]) => Promise<SearchOfferProductsResult>;
  removePrice: (idx: number) => void;
  addPrice: (scroll?: boolean) => void;
  getProductItem: () => void;
  trackInventory: () => boolean;
  currencies: Ref<ICurrency[]>;
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    enable: IBladeToolbar;
    disable: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useOfferDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}): UseDetails<IOffer, OfferDetailsScope> => {
  const { user } = useUser();
  const { t } = useI18n({ useScope: "global" });
  const offerLoading = ref(false);
  const duplicates = ref([]);
  const pricingEqual = ref(false);
  const productLoading = ref(false);
  const { fulfillmentCentersList, searchFulfillmentCenters } = useFulfillmentCenters();

  const { currencies, loadSettings } = useMarketplaceSettings();

  const detailsFactory = useDetailsFactory<IOffer>({
    load: async ({ id }) => (await getApiClient()).getOfferByIdGET(id),
    saveChanges: async (details) => {
      return details.id
        ? (await getApiClient()).updateOffer(
            new UpdateOfferCommand({
              sellerName: user.value.userName,
              offerId: details.id,
              offerDetails: new OfferDetails({ ...details, sku: details.sku }),
            })
          )
        : (await getApiClient()).createNewOffer(
            new CreateNewOfferCommand({
              sellerName: user.value.userName,
              productId: details.productId,
              details: new OfferDetails({ ...details, sku: details.sku }),
            })
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
    return await (
      await getApiClient()
    ).searchOfferProducts(
      new SearchProductsForNewOfferQuery({
        objectIds: ids,
        keyword: keyword,
        skip: skip || 0,
        take: 20,
      })
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
    { deep: true }
  );

  watch(
    () => item.value?.prices,
    (newVal) => {
      nextTick(() => {
        const dupes = [];

        newVal?.forEach((o, idx) => {
          if (
            newVal.some((o2, idx2) => {
              return (
                idx !== idx2 &&
                !!o.minQuantity &&
                !!o2.minQuantity &&
                o.minQuantity === o2.minQuantity &&
                o.currency === o2.currency
              );
            })
          ) {
            dupes.push(`minQuantity_${idx}`);
          }
        });

        duplicates.value = dupes;
        pricingEqual.value = !!dupes.length;
      });
    },
    { deep: true }
  );

  watch(duplicates, (newVal, oldVal) => {
    validationState.value.setErrors(
      Object.values(oldVal).reduce((obj, curr) => {
        obj[curr] = undefined;
        return obj;
      }, {})
    );

    validationState.value.setErrors(
      Object.values(newVal).reduce((obj, curr) => {
        obj[curr] = "Min quantity can't be the same";
        return obj;
      }, {})
    );
  });

  const addEmptyInventory = async () => {
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
      item.value.inventory.push(inventoryInfo);
    });
  };

  function addPrice() {
    if (!item.value.prices) {
      item.value.prices = [];
    }
    item.value.prices.push(
      new OfferPrice({
        currency: "USD",
        listPrice: null,
        minQuantity: null,
      })
    );
  }

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

      if (fetchedProduct && fetchedProduct.length) {
        const currentProduct = fetchedProduct[0];

        if (!args.props.param) {
          item.value.properties = currentProduct.properties;
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

  function removePrice(idx: number) {
    item.value?.prices.splice(idx, 1);
  }

  function trackInventory() {
    return !item.value?.trackInventory;
  }

  onMounted(async () => {
    try {
      offerLoading.value = true;
      await loadSettings();
      if (!args.props.param) {
        // validationState.value.resetModified(ref(new Offer({ inventory: [], prices: [] })), true);
        item.value = reactive(new Offer());
        // await nextTick(async () => {
        console.log(item.value, "test");
        item.value.trackInventory = true;
        item.value.sku = generateSku();
        await addEmptyInventory();
        await addPrice();
        // });

        console.log(item.value);
      }

      const resolveId = (value: string) =>
        args.props.options &&
        "sellerProduct" in args.props.options &&
        args.props.options.sellerProduct &&
        typeof args.props.options.sellerProduct === "object" &&
        value in args.props.options.sellerProduct &&
        (args.props.options?.sellerProduct[value] as string);

      const searchableProductId =
        item.value?.productId || resolveId("publishedProductDataId") || resolveId("stagedProductDataId");
      if (searchableProductId) {
        await setProductItem(searchableProductId);
      }
    } finally {
      offerLoading.value = false;
      validationState.value.resetModified(item.value, true);
    }
  });

  const scope = ref<OfferDetailsScope>({
    fetchProducts,
    removePrice,
    addPrice,
    getProductItem,
    trackInventory,
    currencies,
    toolbarOverrides: {
      saveChanges: {
        disabled: computed(() => {
          return !(item.value?.prices?.length > 0 && validationState.value.valid && validationState.value.modified);
        }),
      },
      enable: {
        async clickHandler() {
          if (item.value?.id) {
            item.value.isActive = true;
          }
        },
        isVisible: computed(() => !!args.props.param && !item.value?.isActive),
      },
      disable: {
        async clickHandler() {
          if (item.value?.id) {
            item.value.isActive = false;
          }
        },
        isVisible: computed(() => !!args.props.param && item.value?.isActive),
      },
    },
    dynamicProperties: useDynamicProperties(),
    multilanguage: useMultilanguage(),
    assetsHandler: {
      images: useAssets(Image),
    },
  });

  return {
    load,
    remove,
    saveChanges,
    scope: computed(() => scope.value),
    loading: useLoading(loading, offerLoading, productLoading),
    item,
    validationState,
    bladeTitle,
  };
};
