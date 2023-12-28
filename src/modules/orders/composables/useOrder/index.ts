import { computed, Ref, ref } from "vue";
import { AsyncAction, useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import { OrderModuleClient } from "@vcmp-vendor-portal/api/orders";
import {
  VcmpSellerOrdersClient,
  CustomerOrder,
  OrderAddressAddressType,
} from "@vcmp-vendor-portal/api/marketplacevendor";
interface IShippingInfo {
  label: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface GetOrderByIdPayload {
  id: string;
}

interface IUseOrder {
  order: Ref<CustomerOrder>;
  shippingInfo: Ref<IShippingInfo[]>;
  loading: Ref<boolean>;
  loadOrder: AsyncAction<GetOrderByIdPayload>;
  loadPdf: () => Promise<void>;
}

const order: Ref<CustomerOrder> = ref({} as CustomerOrder);

export default (): IUseOrder => {
  const { getApiClient: getSellerOrdersApiClient } = useApiClient(VcmpSellerOrdersClient);

  const { loading: orderLoading, action: loadOrder } = useAsync<GetOrderByIdPayload>(async (payload) => {
    const client = await getSellerOrdersApiClient();
    if (payload) {
      order.value = await client.getById(payload.id);
    }
  });

  // TODO: Remove after PT-10642 will be fixed
  const { getApiClient: getOrderApiClient } = useApiClient(OrderModuleClient);

  const { loading: pdfLoading, action: loadPdf } = useAsync(async () => {
    const client = await getOrderApiClient();
    if (order.value.number) {
      const response = await client.getInvoicePdf(order.value.number);
      const dataType = response.data.type;
      const binaryData = [];
      binaryData.push(response.data);
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      downloadLink.setAttribute("download", response.fileName || `Invoice ${order.value.number}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  });

  const loading = useLoading(orderLoading, pdfLoading);

  return {
    order: computed(() => order.value),
    shippingInfo: computed(() => {
      const info =
        order.value.addresses &&
        order.value.addresses.reduce((acc, address) => {
          const orderInfo = {
            name: `${address.firstName} ${address.lastName}`,
            address: `${address.line1 ?? ""} ${address.line2 ?? ""}, ${address.city ?? ""}, ${
              address.postalCode ?? ""
            } ${address.countryCode ?? ""}`,
            phone: address.phone ?? "",
            email: address.email ?? "",
          };
          switch (address.addressType) {
            case OrderAddressAddressType.Billing:
              acc.push({ label: "Sold to", ...orderInfo });
              break;
            case OrderAddressAddressType.Shipping:
              acc.push({ label: "Ship to", ...orderInfo });
              break;
            case OrderAddressAddressType.BillingAndShipping:
              acc.push({ label: "Sold to", ...orderInfo }, { label: "Ship to", ...orderInfo });
              break;
            case OrderAddressAddressType.Pickup:
              acc.push({ label: "Pick-up at", ...orderInfo });
              break;
          }
          return acc;
        }, [] as IShippingInfo[]);
      return info && info.length ? info : [{ label: "Sold to" }, { label: "Ship to" }];
    }),
    loadOrder,
    loadPdf,
    loading,
  };
};
