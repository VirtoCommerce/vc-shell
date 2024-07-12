import { useI18n } from "vue-i18n";
import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  ListComposableArgs,
  ListBaseBladeScope,
  useUser,
  UseList,
  TOpenBladeArgs,
} from "@vc-shell/framework";
import {
  SearchOrdersQuery,
  VcmpSellerOrdersClient,
  CustomerOrder,
  ISearchOrdersQuery,
  ISeller,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, inject, ref } from "vue";
import { useRoute } from "vue-router";

enum PaymentStatus {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Accepted = "Accepted",
  Shipped = "Shipped",
  Cancelled = "Cancelled",
}

export interface OrdersListScope extends ListBaseBladeScope<CustomerOrder> {}

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useOrders = (args?: ListComposableArgs): UseList<CustomerOrder[], ISearchOrdersQuery, OrdersListScope> => {
  const { user } = useUser();
  const { t } = useI18n({ useScope: "global" });
  const currentSeller = inject("currentSeller") as Ref<ISeller>;

  const factory = useListFactory<CustomerOrder[], ISearchOrdersQuery>({
    load: async (query) => {
      const sellerId = currentSeller.value?.id;
      return (await getApiClient()).searchOrders(
        new SearchOrdersQuery({
          ...query,
          employeeId: sellerId ?? user.value?.id,
          sellerId: sellerId,
        }),
      );
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("OrderDetails"),
      ...args,
    });
  }

  const scope: OrdersListScope = {
    openDetailsBlade,
    statuses: computed(() => {
      const statusKey = Object.entries(PaymentStatus);
      return statusKey.map(([value, displayValue]) => ({
        value,
        displayValue: computed(() => t(`ORDERS.PAGES.LIST.TABLE.FILTER.STATUS.${displayValue}`)),
      }));
    }),
  };

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope,
  };
};
