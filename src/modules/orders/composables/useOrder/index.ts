import {
  useApiClient,
  useDetailsFactory,
  DynamicBladeForm,
  DetailsBaseBladeScope,
  UseDetails,
  IBladeToolbar,
  useAsync,
  useLoading,
  useLanguages,
} from "@vc-shell/framework";
import { StateMachineInstance, VcmpSellerOrdersClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, Ref, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CustomerOrder, OrderAddressAddressType, OrderModuleClient } from "@vcmp-vendor-portal/api/orders";
import { useStateMachines } from "../../../state-machines/composables";
import moment from "moment";

interface IShippingInfo {
  label: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface OrderScope extends DetailsBaseBladeScope {
  toolbarOverrides: ComputedRef<IBladeToolbar[]>;
  shippingInfo: ComputedRef<IShippingInfo[]>;
  addressVisibility: (
    schema: {
      property: keyof IShippingInfo;
    },
    fieldContext: IShippingInfo,
  ) => boolean;
  phoneVisibility: (
    schema: {
      property: keyof IShippingInfo;
    },
    fieldContext: IShippingInfo,
  ) => boolean;
  emailVisibility: (
    schema: {
      property: keyof IShippingInfo;
    },
    fieldContext: IShippingInfo,
  ) => boolean;
  subTotal: ComputedRef<string | 0 | undefined>;
  discountTotal: ComputedRef<string | 0 | undefined>;
  total: ComputedRef<string | 0 | undefined>;
  feeTotal: ComputedRef<string | 0 | undefined>;
  createdDate: ComputedRef<string>;
}

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useOrder = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<CustomerOrder, OrderScope> => {
  const factory = useDetailsFactory<CustomerOrder>({
    load: async (item) => {
      if (item?.id) {
        return (await getApiClient()).getById(item.id);
      }
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const { currentLocale } = useLanguages();

  const { t } = useI18n({ useScope: "global" });
  const { searchStateMachines, stateMachine, fireTrigger } = useStateMachines();

  const toolbar = ref([
    {
      title: computed(() => t("ORDERS.PAGES.DETAILS.TOOLBAR.DL_PDF")),
      icon: "fas fa-file-pdf",
      async clickHandler() {
        if (args.props.param) {
          await loadPdf();
        }
      },
      disabled: !args.props.param,
    },
  ]) as Ref<IBladeToolbar[]>;

  const shippingInfo = computed(() => {
    const info =
      item.value?.addresses &&
      item.value?.addresses.reduce((acc, address) => {
        const orderInfo = {
          name: `${address.firstName} ${address.lastName}`,
          address: `${address.line1 ?? ""} ${address.line2 ?? ""}, ${address.city ?? ""}, ${address.postalCode ?? ""} ${
            address.countryCode ?? ""
          }`,
          phone: address.phone ?? "",
          email: address.email ?? "",
        };
        switch (address.addressType) {
          case OrderAddressAddressType.Billing:
            acc.push({ label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SOLD_TO"), ...orderInfo });
            break;
          case OrderAddressAddressType.Shipping:
            acc.push({ label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SHIP_TO"), ...orderInfo });
            break;
          case OrderAddressAddressType.BillingAndShipping:
            acc.push(
              { label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SOLD_TO"), ...orderInfo },
              { label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SHIP_TO"), ...orderInfo },
            );
            break;
          case OrderAddressAddressType.Pickup:
            acc.push({ label: "Pick-up at", ...orderInfo });
            break;
        }
        return acc;
      }, [] as IShippingInfo[]);
    return info && info.length
      ? info
      : [
          { label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SOLD_TO") },
          { label: t("ORDERS.PAGES.DETAILS.FORM.BUYER_RECIPIENT.SHIP_TO") },
        ];
  });

  // TODO: Remove after PT-10642 will be fixed
  const { getApiClient: getOrderApiClient } = useApiClient(OrderModuleClient);

  const { loading: pdfLoading, action: loadPdf } = useAsync(async () => {
    if (item.value?.number) {
      const response = await (await getOrderApiClient()).getInvoicePdf(item.value.number);
      const dataType = response.data.type;
      const binaryData = [];
      binaryData.push(response.data);
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      downloadLink.setAttribute("download", response.fileName || `Invoice ${item.value.number}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  });

  const scope = ref<OrderScope>({
    toolbarOverrides: computed(() => toolbar.value),
    shippingInfo,
    addressVisibility: (schema: { property: keyof IShippingInfo }, fieldContext: IShippingInfo) => {
      return !!fieldContext[schema.property];
    },
    phoneVisibility: (schema: { property: keyof IShippingInfo }, fieldContext: IShippingInfo) => {
      return !!fieldContext[schema.property];
    },
    emailVisibility: (schema: { property: keyof IShippingInfo }, fieldContext: IShippingInfo) => {
      return !!fieldContext[schema.property];
    },
    subTotal: computed(() => item.value?.subTotal && item.value?.subTotal.toFixed(2) + " " + item.value?.currency),
    discountTotal: computed(
      () => item.value?.discountTotal && item.value?.discountTotal.toFixed(2) + " " + item.value?.currency,
    ),
    total: computed(() => item.value?.total && item.value?.total.toFixed(2) + " " + item.value?.currency),
    feeTotal: computed(() => item.value?.feeTotal && item.value?.feeTotal.toFixed(2) + " " + item.value?.currency),
    createdDate: computed(() => {
      const date = new Date(item.value?.createdDate ?? "");
      return moment(date).locale(currentLocale.value).format("L LT");
    }),
  });

  watch(
    () => args?.mounted.value,
    async () => {
      if (args.props.param) {
        await searchStateMachines({
          objectTypes: [
            "VirtoCommerce.OrdersModule.Core.Model.CustomerOrder",
            "VirtoCommerce.MarketplaceVendorModule.Core.Domains.SellerOrder",
          ],
          objectIds: [args.props.param],
        });
        if (stateMachine.value) {
          refreshToolbar(stateMachine.value);
        }
      }
    },
  );

  const refreshToolbar = (sm: StateMachineInstance) => {
    toolbar.value.splice(0);
    sm.currentState?.transitions?.forEach((transition) => {
      toolbar.value.push({
        title: computed(() => t(`ORDERS.PAGES.DETAILS.TOOLBAR.${transition.trigger?.toUpperCase()}`)),
        icon: transition.icon ?? "fas fa-tasks",
        async clickHandler() {
          const currentStateMachine = await fireTrigger(sm.id!, transition.trigger!, args.props.param!);
          args.emit("parent:call", {
            method: "reload",
          });
          item.value!.status = transition.toState;
          refreshToolbar(currentStateMachine);
        },
      });
    });
  };

  return {
    load,
    saveChanges,
    remove,
    loading: useLoading(loading, pdfLoading),
    item,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() => item.value?.number ?? ""),
  };
};
