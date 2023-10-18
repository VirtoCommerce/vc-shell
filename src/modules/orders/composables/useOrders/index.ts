import { computed, Ref, ref } from "vue";
import { AsyncAction, useApiClient, useAsync, useLoading, useUser } from "@vc-shell/framework";
import {
  VcmpSellerOrdersClient,
  CustomerOrderSearchResult,
  SearchOrdersQuery,
  ISearchOrdersQuery,
  CustomerOrder,
  ChangeOrderStatusCommand,
} from "vcmp-vendor-portal-api/marketplacevendor";

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

interface ChangeOrderStatusPayload {
  orderId: string;
  newStatus: string;
}

interface IUseOrders {
  readonly orders: Ref<CustomerOrder[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly currentPage: Ref<number>;
  PaymentStatus: Ref<IPaymentStatus>;
  loadOrders(query?: ISearchOrdersQuery): void;
  changeOrderStatus: AsyncAction<ChangeOrderStatusPayload>;
}

export default (): IUseOrders => {
  const { user } = useUser();
  const orders = ref(new CustomerOrderSearchResult({ results: [] }));
  const currentPage = ref(1);
  const statuses = computed(() => {
    const statusKey = Object.entries(PaymentStatus);
    return Object.fromEntries(statusKey);
  });

  const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

  const { loading: ordersLoading, action: loadOrders } = useAsync<ISearchOrdersQuery>(async (query) => {
    const client = await getApiClient();
    orders.value = await client.searchOrders({
      take: 20,
      ...(query || {}),
      employeeId: user.value?.id,
    } as SearchOrdersQuery);
    currentPage.value = (query?.skip || 0) / Math.max(1, query?.take || 20) + 1;
  });

  // TODO: Support multiple ordes
  const { loading: changeOrderStatusLoading, action: changeOrderStatus } = useAsync<ChangeOrderStatusPayload>(
    async (payload) => {
      const client = await getApiClient();
      const command = new ChangeOrderStatusCommand({
        orderId: payload.orderId,
        newStatus: payload.newStatus,
      });
      await client.updateOrderStatus(command);
    }
  );

  const loading = useLoading(ordersLoading, changeOrderStatusLoading);

  return {
    orders: computed(() => orders.value?.results),
    totalCount: computed(() => orders.value?.totalCount),
    pages: computed(() => Math.ceil(orders.value?.totalCount / 20)),
    loading,
    currentPage: computed(() => currentPage.value),
    PaymentStatus: computed(() => statuses.value),
    loadOrders,
    changeOrderStatus,
  };
};
