import { useApiClient, useBladeNavigation, useListFactory, DynamicBladeList } from "@vc-shell/framework";
import { SearchSellerUsersQuery, VcmpSellerSecurityClient } from "../../../../api_client/marketplacevendor";

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);
const client = getApiClient();

export const useTeamList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}) => {
  const factory = useListFactory({
    load: async (query) => {
      const command = new SearchSellerUsersQuery(query);

      return (await client).searchSellerUsers(command);
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

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope: {
      openDetailsBlade,
    },
  };
};
