import { computed, Ref, ref } from "vue";
import { useLogger, useUser } from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrderSearchResult,
  CustomerOrderSearchCriteria,
  ICustomerOrderSearchCriteria,
  CustomerOrder,
} from "@virtoshell/api-client";

interface IUseOrders {
  readonly orders: Ref<CustomerOrder[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly currentPage: Ref<number>;
  loadOrders(query?: ICustomerOrderSearchCriteria): void;
  deleteOrders(args: { ids: string[] }): void;
  changeOrderStatus(order: CustomerOrder): Promise<void>;
}

export default (): IUseOrders => {
  const logger = useLogger();
  const { getAccessToken, user } = useUser();
  const loading = ref(false);
  const orders = ref(new CustomerOrderSearchResult({ results: [] }));
  const currentPage = ref(1);

  async function getApiClient(): Promise<OrderModuleClient> {
    const client = new OrderModuleClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadOrders(query?: ICustomerOrderSearchCriteria) {
    loading.value = true;
    const client = await getApiClient();
    try {
      orders.value = await client.searchCustomerOrder({
        take: 20,
        ...(query || {}),
        employeeId: user.value.id,
      } as CustomerOrderSearchCriteria);
      currentPage.value =
        (query?.skip || 0) / Math.max(1, query?.take || 20) + 1;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOrders(args: { ids: string[] }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteOrdersByIds(args.ids);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
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
    orders: computed(() => orders.value?.results),
    totalCount: computed(() => orders.value?.totalCount),
    pages: computed(() => Math.ceil(orders.value?.totalCount / 20)),
    loading: computed(() => loading.value),
    currentPage: computed(() => currentPage.value),
    loadOrders,
    deleteOrders,
    changeOrderStatus,
  };
};
