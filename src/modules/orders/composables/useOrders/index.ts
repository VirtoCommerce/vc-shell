import { useI18n } from "vue-i18n";
import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  DynamicBladeList,
  ListBaseBladeScope,
  useUser,
  UseList,
} from "@vc-shell/framework";
import {
  SearchOrdersQuery,
  VcmpSellerOrdersClient,
  CustomerOrder,
  ISearchOrdersQuery,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";

enum PaymentStatus {
  Unpaid = "Unpaid",
  Paid = "Paid",
  Accepted = "Accepted",
  Shipped = "Shipped",
  Cancelled = "Cancelled",
}

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useOrders = (args?: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}): UseList<CustomerOrder[], ISearchOrdersQuery> => {
  const { user } = useUser();
  const { t } = useI18n({ useScope: "global" });

  const factory = useListFactory<CustomerOrder[], ISearchOrdersQuery>({
    load: async (query) => {
      return (await getApiClient()).searchOrders(
        new SearchOrdersQuery({
          ...query,
          employeeId: user.value?.id,
        }),
      );
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("OrderDetails"),
      ...args,
    });
  }

  const scope = ref<ListBaseBladeScope>({
    openDetailsBlade,
    statuses: computed(() => {
      const statusKey = Object.entries(PaymentStatus);
      return statusKey.map(([value, displayValue]) => ({
        value,
        displayValue: computed(() => t(`ORDERS.PAGES.LIST.TABLE.FILTER.STATUS.${displayValue}`)),
      }));
    }),
  });

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope: computed(() => scope.value),
  };
};
