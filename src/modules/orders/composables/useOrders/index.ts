import { computed, Ref, ref } from "vue";
import { useLogger, useUser } from "@vc-shell/framework";
import {
  VcmpSellerOrdersClient,
  CustomerOrderSearchResult,
  SearchOrdersQuery,
  ISearchOrdersQuery,
  ChangeOrderStatusCommand,
  CustomerOrder,
} from "../../../../api_client/marketplacevendor";

interface IPaymentStatus {
  [key: string]: string;
}
enum PaymentStatus {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Accepted = "Accepted",
  Shipped = "Shipped",
  Cancelled = "Cancelled",
}

interface IUseOrders {
  readonly orders: Ref<CustomerOrder[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly currentPage: Ref<number>;
  PaymentStatus: Ref<IPaymentStatus>;
  loadOrders(query?: ISearchOrdersQuery): void;
  changeOrderStatus(orderId: string, newStatus: string): Promise<void>;
}

export default (): IUseOrders => {
  const logger = useLogger();
  const { getAccessToken, user } = useUser();
  const loading = ref(false);
  const orders = ref(new CustomerOrderSearchResult({ results: [] }));
  const currentPage = ref(1);
  const statuses = computed(() => {
    const statusKey = Object.entries(PaymentStatus);
    return Object.fromEntries(statusKey);
  });

  async function getApiClient(): Promise<VcmpSellerOrdersClient> {
    const client = new VcmpSellerOrdersClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadOrders(query?: ISearchOrdersQuery) {
    loading.value = true;
    const client = await getApiClient();
    try {
      orders.value = await client.searchOrders({
        take: 20,
        ...(query || {}),
        employeeId: user.value.id,
      } as SearchOrdersQuery);
      currentPage.value =
        (query?.skip || 0) / Math.max(1, query?.take || 20) + 1;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changeOrderStatus(
    orderId: string,
    newStatus: string
  ): Promise<void> {
    loading.value = true;
    const client = await getApiClient();
    try {
      const command = new ChangeOrderStatusCommand({
        orderId,
        newStatus,
      });
      await client.updateOrderStatus(command);
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
    PaymentStatus: computed(() => statuses.value),
    loadOrders,
    changeOrderStatus,
  };
};
