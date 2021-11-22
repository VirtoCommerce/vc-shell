/* eslint-disable */
import { computed, Ref, ref } from "vue";
import { useUser, useLogger} from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrder,
  FileResponse,
} from "@virtoshell/api-client";

interface IUseOrder {
    order: Ref<CustomerOrder>;
    loading: Ref<boolean>;
    loadOrder: (args: { id: string }) => CustomerOrder;
    loadPdf: () => Promise<FileResponse>;
  }


const order: Ref<CustomerOrder> = ref({} as CustomerOrder);

export default () => {
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
      let dataType = response.data.type;
      let binaryData = [];
      binaryData.push(response.data);
      let downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      downloadLink.setAttribute('download', response.fileName || `Invoice ${order.value.number}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  return {
    order: computed(() => order.value),
    loadOrder,
    loadPdf,
    loading,
  };
};
