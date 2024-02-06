import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  DynamicBladeList,
  ListBaseBladeScope,
  useUser,
} from "@vc-shell/framework";
import { SearchOrdersQuery, VcmpSellerOrdersClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useOrders = (args?: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}) => {
  const { user } = useUser();

  const factory = useListFactory({
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
