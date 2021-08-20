/* eslint-disable */
import { computed, Ref, ref } from "vue";
import { useUser } from "@virtoshell/core";
import {
  OrderModuleClient,
  CustomerOrderSearchResult,
  CustomerOrderSearchCriteria,
} from "@virtoshell/api-client";

const orders: Ref<CustomerOrderSearchResult> = ref(
  new CustomerOrderSearchResult({ results: [] })
);

export default () => {
  async function loadOrders() {
    var { accessToken } = useUser();
    const client = new OrderModuleClient();
    client.setAuthToken(accessToken.value);
    orders.value = await client.searchCustomerOrder({
      take: 20,
    } as CustomerOrderSearchCriteria);
  }

  return {
    orders: computed(() => orders.value),
    loadOrders,
  };
};
