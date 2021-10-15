/* eslint-disable */
import { computed, Ref, ref } from "vue";
import { useUser, useLogger} from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrder,
} from "@virtoshell/api-client";

interface IUseOrder {
    order: Ref<CustomerOrder>;    
    loading: Ref<boolean>;
    loadOrder: (args: { id: string }) => CustomerOrder;   
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

  return {
    order: computed(() => order.value),    
    loadOrder,
    loading,
  };
};
