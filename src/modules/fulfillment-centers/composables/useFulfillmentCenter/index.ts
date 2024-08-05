import {
  useApiClient,
  useDetailsFactory,
  DetailsComposableArgs,
  DetailsBaseBladeScope,
  UseDetails,
  usePopup,
  IBladeToolbar,
} from "@vc-shell/framework";
import {
  FulfillmentCenter,
  IFulfillmentCenter,
  InventoryAddress,
  UpdateFulfillmentCenterCommand,
  VcmpSellerCatalogClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSellerDetails } from "../../../seller-details/composables";
import { useRoute } from "vue-router";

export interface FulfillmentCenterScope extends DetailsBaseBladeScope {
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    reset: IBladeToolbar;
    remove: IBladeToolbar;
  };
}

interface ILocation {
  id: string;
  name: string;
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useFulfillmentCenter = (
  args: DetailsComposableArgs,
): UseDetails<FulfillmentCenter, FulfillmentCenterScope> => {
  const factory = useDetailsFactory<FulfillmentCenter>({
    load: async (item) => {
      if (item?.id) {
        return (await getApiClient()).getFulfillmentCenterById(item.id);
      }
    },
    saveChanges: async (details) => {
      const sellerId = await GetSellerId();
      return (await getApiClient()).updateFulfillmentCenter(
        new UpdateFulfillmentCenterCommand({
          sellerId: sellerId,
          fulfillmentCenter: new FulfillmentCenter(details as IFulfillmentCenter),
        }),
      );
    },
    remove: async ({ id }) => {
      if (args.props.param) {
        return await (await getApiClient()).deleteFulfillmentCenter([id]);
      }
    },
  });

  // We need to initialize other composables before the main factory to prevent the initialization of useSellerDetails's useForm for this composable.
  const { item: sellerDetailsItem } = useSellerDetails();
  const { load, saveChanges, remove, loading, item, validationState } = factory();
  const { showConfirmation } = usePopup();
  const route = useRoute();

  const countriesList = ref<ILocation[]>([]);
  const regionsList = ref<ILocation[]>([]);

  const { t } = useI18n({ useScope: "global" });

  async function getCountries() {
    try {
      const result = await fetch("/api/platform/common/countries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
      });

      result.text().then((response) => {
        countriesList.value = JSON.parse(response);
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function getRegions(countryId: string) {
    try {
      const result = await fetch(`/api/platform/common/countries/${countryId}/regions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
      });

      result.text().then((response) => {
        regionsList.value = JSON.parse(response);
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  function setCountry(countryId: string) {
    if (countryId) {
      const countryInfo = countriesList.value.find((x) => x.id === countryId);
      if (countryInfo && item.value!.address) {
        (item.value!.address = new InventoryAddress({
          ...item.value!.address,
          countryCode: countryInfo.id,
          countryName: countryInfo.name,
        })),
          (item.value!.address.regionName = undefined);
        item.value!.address.regionId = undefined;
      }
    }
  }

  function setRegion(regionId: string) {
    if (regionId) {
      const regionInfo = regionsList.value.find((x) => x.id === regionId);
      if (regionInfo && item.value!.address) {
        item.value!.address.regionId = regionInfo.id;
        item.value!.address.regionName = regionInfo.name;
      }
    }
  }

  async function onCountryChange(e: string) {
    setCountry(e);
  }

  const scope = {
    onCountryChange,
    countriesList,
    setRegion,
    regionsList,
    toolbarOverrides: {
      saveChanges: {
        disabled: computed(() => !(!validationState.value.disabled && validationState.value.modified)),
      },
      reset: {
        clickHandler: () => {
          validationState.value.resetModified(validationState.value.cachedValue, true);
        },
        isVisible: computed(() => !!args.props.param),
        disabled: computed(() => !!args.props.param && !validationState.value.modified),
      },
      remove: {
        clickHandler: async () => {
          if (
            await showConfirmation(
              computed(() => t("FULFILLMENT_CENTERS.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")),
            )
          ) {
            remove?.();
          }
        },
        isVisible: computed(() => !!args.props.param),
        disabled: computed(() => true),
      },
    },
  };

  watch(
    () => args?.mounted.value,
    async () => {
      await getCountries();

      if (!args.props.param) {
        item.value = reactive(new FulfillmentCenter());
        item.value.organizationId = sellerDetailsItem.value?.id;
        validationState.value.resetModified(item.value, true);
      }
    },
  );

  watch(
    () => item.value?.address,
    (newVal) => {
      if (newVal && newVal.countryCode) {
        getRegions(newVal.countryCode);
      }
    },
    { deep: true },
  );

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope,
    bladeTitle: computed(() =>
      args.props.param ? item.value?.name ?? "" : (t("FULFILLMENT_CENTERS.PAGES.DETAILS.TITLE") as string),
    ),
  };
};
