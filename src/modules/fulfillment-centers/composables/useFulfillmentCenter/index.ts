import {
  useApiClient,
  useDetailsFactory,
  DynamicBladeForm,
  DetailsBaseBladeScope,
  UseDetails,
  usePopup,
  IBladeToolbar,
} from "@vc-shell/framework";
import {
  FulfillmentCenter,
  IFulfillmentCenter,
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

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useFulfillmentCenter = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<FulfillmentCenter, FulfillmentCenterScope> => {
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

  const { t } = useI18n({ useScope: "global" });

  const scope = ref<FulfillmentCenterScope>({
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
  });

  watch(
    () => args?.mounted.value,
    async () => {
      if (!args.props.param) {
        item.value = reactive(new FulfillmentCenter());
        item.value.organizationId = sellerDetailsItem.value?.id;
        validationState.value.resetModified(item.value, true);
      }
    },
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
    scope: computed(() => scope.value),
    bladeTitle: computed(() =>
      args.props.param ? item.value?.name ?? "" : (t("FULFILLMENT_CENTERS.PAGES.DETAILS.TITLE") as string),
    ),
  };
};
