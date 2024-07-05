import { useI18n } from "vue-i18n";
import {
  DetailsComposableArgs,
  UseDetails,
  useAsync,
  useBladeNavigation,
  useDetailsFactory,
  useLoading,
  useApiClient,
  DetailsBaseBladeScope,
  IBladeToolbar,
} from "@vc-shell/framework";
import {
  OrderShipment,
  FulfillmentCenter,
  SellerUser,
  OrderLineItem,
  VcmpSellerOrdersClient,
  SearchShipmentsQuery,
  UpdateOrderShipmentCommand,
  ISeller,
  ShippingMethod,
  OrderShipmentItem,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, Ref, WritableComputedRef, computed, inject, reactive, ref, watch } from "vue";
import { useFulfillmentCenters } from "../../../fulfillment-centers/composables";
import { useTeamList } from "../../../team/composables";
import * as _ from "lodash-es";

export interface ShippingDetailsScope extends DetailsBaseBladeScope {
  fulfillmentCenters: ComputedRef<FulfillmentCenter[]>;
  employee: ComputedRef<SellerUser[]>;
  addNewLineItem: () => Promise<void>;
  addLineItems: (data: { selectedIds: string[] }) => void;
  removeLineItem: (lineItem: OrderLineItem, idx: number) => void;
  setEmployee: WritableComputedRef<SellerUser | undefined>;
  setFulfillmentCenter: WritableComputedRef<FulfillmentCenter | undefined>;
  toolbarOverrides: {
    remove: IBladeToolbar;
    saveChanges: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useShippingDetails = (
  args: DetailsComposableArgs<{
    options: {
      items: OrderLineItem[];
      orderId: string;
      shipment: OrderShipment;
    };
  }>,
): UseDetails<OrderShipment, ShippingDetailsScope> => {
  const internalModel = ref<OrderShipment | undefined>(_.cloneDeep(args.props.options?.shipment));

  const factory = useDetailsFactory<OrderShipment>({
    load: () => {
      return internalModel.value;
    },
    remove: async () => {
      args.emit("parent:call", {
        method: "removeShipment",
        args: { item: internalModel.value },
      });
    },
    saveChanges: async (item) => {
      args.emit("parent:call", {
        method: "saveShipment",
        args: { item },
      });
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const {
    load: loadFulfillmentCenters,
    loading: fulfillmentCentersLoading,
    items: fulfillmentCenters,
  } = useFulfillmentCenters();

  const { load: loadEmployee, loading: employeeLoading, items: employee } = useTeamList();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const { t } = useI18n({ useScope: "global" });

  const shippingMethods = ref<ShippingMethod[]>([]);
  const shippingStatuses = ref<{ value: string; label: string }[]>([]);

  watch(
    () => args?.mounted.value,
    async () => {
      await loadFulfillmentCenters();
      await loadEmployee();
      await getShippingMethods();
      await getShippingStatuses();

      const newShipment = await (await getApiClient()).getNewShipment(args.props.options?.orderId);

      if (!args.props.param) {
        internalModel.value = reactive(new OrderShipment(newShipment));

        internalModel.value.createdDate = new Date();

        validationState.value.resetModified(internalModel, true);
      }
    },
  );

  async function addNewLineItem() {
    await openBlade({
      blade: resolveBladeByName("ShippingItems"),
      options: {
        items: args.props.options?.items,
      },
    });
  }

  function addLineItems(data: { selectedIds: string[] }) {
    const lineItems = args.props.options?.items.filter((item) => item.id && data.selectedIds.includes(item.id));

    if (!lineItems) return;

    if (!internalModel.value!.items) {
      internalModel.value!.items = [];
    }

    lineItems.forEach((lineItem) => {
      const exists = internalModel.value!.items?.some((existingItem) => existingItem.lineItemId === lineItem.id);
      if (!exists) {
        internalModel.value!.items?.push(
          new OrderShipmentItem({
            lineItem,
            lineItemId: lineItem.id,
            quantity: lineItem.quantity,
          }),
        );
      }
    });
  }

  function removeLineItem(lineItem: OrderLineItem, idx: number) {
    internalModel.value?.items?.splice(idx, 1);
  }

  const { loading: getShippingMethodsLoading, action: getShippingMethods } = useAsync(async () => {
    shippingMethods.value = await (await getApiClient()).getShippingMethods();
  });

  const { loading: getShippingStatusesLoading, action: getShippingStatuses } = useAsync(async () => {
    shippingStatuses.value = (await (await getApiClient()).getShipmentStatuses()).map((status) => ({
      value: status,
      label: status,
    }));
  });

  const scope: ShippingDetailsScope = {
    fulfillmentCenters,
    employee,
    addNewLineItem,
    addLineItems,
    removeLineItem,
    shippingStatuses,
    shippingMethods,
    disabledDateTime: true,
    isShippingMethodDisabled: true,
    isShippingMethodVisible: computed(() => !!args.props.param),
    isShippingMethodSelectVisible: computed(() => !args.props.param),
    shipmentMethodCode: computed({
      get() {
        return shippingMethods.value.find((method) => method.code === internalModel.value?.shipmentMethodCode);
      },
      set(value) {
        internalModel.value!.shipmentMethodCode = value?.code;
        internalModel.value!.shippingMethod = new ShippingMethod(value);
      },
    }),
    setEmployee: computed({
      get() {
        return employee.value?.find((emp) => emp.id === internalModel.value?.employeeId);
      },
      set(value: SellerUser | undefined) {
        internalModel.value!.employeeId = value?.id;
        internalModel.value!.employeeName = value?.fullName;
      },
    }),
    setFulfillmentCenter: computed({
      get() {
        return fulfillmentCenters.value?.find((fc) => fc.id === internalModel.value?.fulfillmentCenterId);
      },
      set(value: FulfillmentCenter | undefined) {
        internalModel.value!.fulfillmentCenterId = value?.id;
        internalModel.value!.fulfillmentCenterName = value?.name;
      },
    }),
    toolbarOverrides: {
      remove: {
        isVisible: computed(() => !!args.props.options?.shipment),
      },
      saveChanges: {
        disabled: computed(() => {
          return validationState.value.valid && validationState.value.modified;
        }),
      },
    },
  };

  return {
    bladeTitle: computed(() =>
      internalModel.value?.number
        ? t("SHIPPING.PAGES.DETAILS.TITLE_EDIT") + internalModel.value.number
        : t("SHIPPING.PAGES.DETAILS.TITLE"),
    ),
    load,
    saveChanges,
    remove,
    loading: useLoading(
      loading,
      fulfillmentCentersLoading,
      employeeLoading,
      getShippingMethodsLoading,
      getShippingStatusesLoading,
    ),
    item,
    validationState,
    scope,
  };
};
