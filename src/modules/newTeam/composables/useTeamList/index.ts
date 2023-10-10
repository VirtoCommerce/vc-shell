import { useApiClient, useBladeNavigation, useListFactory, DynamicBladeList } from "@vc-shell/framework";
import { SearchSellerUsersQuery, VcmpSellerSecurityClient } from "../../../../api_client/marketplacevendor";
import { computed, ref } from "vue";

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useTeamList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}) => {
  const factory = useListFactory({
    load: async (query) => {
      const command = new SearchSellerUsersQuery(query);

      return (await getApiClient()).searchSellerUsers(command);
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    openBlade({
      blade: resolveBladeByName("Person"),
      ...args,
    });
  }

  const scope = ref({
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
