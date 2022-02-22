import { computed, Ref, ref } from "vue";
import { useUser, useLogger } from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrder,
  AddressType,
} from "@virtoshell/api-client";
import { IShippingInfo } from "../../../../types";

interface IUseOrder {
  order: Ref<CustomerOrder>;
  shippingInfo: Ref<IShippingInfo[]>;
  loading: Ref<boolean>;
  loadOrder: (args: { id: string }) => Promise<CustomerOrder>;
  loadPdf: () => Promise<void>;
  changeOrderStatus: (order: CustomerOrder) => Promise<void>;
}

const order: Ref<CustomerOrder> = ref({} as CustomerOrder);

export default (): IUseOrder => {
  const logger = useLogger();
  const loading = ref(false);

  async function getApiClient(): Promise<OrderModuleClient> {
    const { getAccessToken } = useUser();
    const client = new OrderModuleClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadOrder(args: { id: string }): Promise<CustomerOrder> {
    loading.value = true;
    const client = await getApiClient();
    try {
      loading.value = true;
      order.value = await client.getById(args.id, null);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
    return order.value;
  }

  async function loadPdf(): Promise<void> {
    const client = await getApiClient();
    try {
      const response = await client.getInvoicePdf(order.value.number);
      const dataType = response.data.type;
      const binaryData = [];
      binaryData.push(response.data);
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(
        new Blob(binaryData, { type: dataType })
      );
      downloadLink.setAttribute(
        "download",
        response.fileName || `Invoice ${order.value.number}`
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async function changeOrderStatus(order: CustomerOrder): Promise<void> {
    loading.value = true;
    const client = await getApiClient();
    try {
      await client.updateOrder(order);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    order: computed(() => order.value),
    shippingInfo: computed(() => {
      const info =
        order.value.addresses &&
        order.value.addresses.reduce((acc, address) => {
          const orderInfo = {
            name: `${address.firstName} ${address.lastName}`,
            address: `${address.line1 ?? ""} ${address.line2 ?? ""}, ${
              address.city ?? ""
            }, ${address.postalCode ?? ""} ${address.countryCode ?? ""}`,
            phone: address.phone ?? "",
            email: address.email ?? "",
          };
          switch (address.addressType) {
            case AddressType.Billing:
              acc.push({ label: "Sold to", ...orderInfo });
              break;
            case AddressType.Shipping:
              acc.push({ label: "Ship to", ...orderInfo });
              break;
            case AddressType.BillingAndShipping:
              acc.push(
                { label: "Sold to", ...orderInfo },
                { label: "Ship to", ...orderInfo }
              );
              break;
            case AddressType.Pickup:
              acc.push({ label: "Pick-up at", ...orderInfo });
              break;
          }
          return acc;
        }, []);
      return info && info.length
        ? info
        : [{ label: "Sold to" }, { label: "Ship to" }];
    }),
    loadOrder,
    loadPdf,
    changeOrderStatus,
    loading,
  };
};
