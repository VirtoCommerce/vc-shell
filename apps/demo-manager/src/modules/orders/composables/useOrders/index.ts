/* eslint-disable */
import { computed, Ref, ref } from "vue";
import { useUser } from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrderSearchResult,
  CustomerOrderSearchCriteria,
  ICustomerOrderSearchCriteria,
} from "@virtoshell/api-client";

const orders: Ref<CustomerOrderSearchResult> = ref(
  new CustomerOrderSearchResult({ results: [] })
);

export default () => {
  const loading = ref(false);
  const currentPage = ref(1);

  async function loadOrders(query?: ICustomerOrderSearchCriteria) {
    loading.value = true;
    const { getAccessToken } = useUser();
    const client = new OrderModuleClient();

    client.setAuthToken(await getAccessToken());
    orders.value = await client.searchCustomerOrder({
      take: 20,
      ...(query || {})
    } as CustomerOrderSearchCriteria);
    currentPage.value = ((query?.skip || 0) / Math.max(1, query?.take || 20)) + 1
    loading.value = false;
  }

  return {
    orders: computed(() => orders.value),
    pages: computed(() => Math.ceil(orders.value?.totalCount / 20)),
    currentPage,
    loading,
    loadOrders,
  };
};
