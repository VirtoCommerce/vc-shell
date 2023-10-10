import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  DynamicBladeList,
  ListBaseBladeScope,
  UseList,
} from "@vc-shell/framework";
import {
  ISearchSellerUsersQuery,
  SearchSellerUsersQuery,
  SellerUser,
  VcmpSellerSecurityClient,
} from "../../../../api_client/marketplacevendor";
import { computed, ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TeamListBladeScope extends ListBaseBladeScope {}

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useTeamList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}): UseList<SellerUser[], ISearchSellerUsersQuery, TeamListBladeScope> => {
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

  const scope = ref<TeamListBladeScope>({
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
