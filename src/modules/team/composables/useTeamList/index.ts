import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  ListComposableArgs,
  ListBaseBladeScope,
  TOpenBladeArgs,
  UseList,
} from "@vc-shell/framework";
import {
  ISearchSellerUsersQuery,
  SearchSellerUsersQuery,
  SellerUser,
  VcmpSellerSecurityClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export interface TeamListScope extends ListBaseBladeScope {}

export const useTeamList = (
  args?: ListComposableArgs,
): UseList<SellerUser[], ISearchSellerUsersQuery, TeamListScope> => {
  const factory = useListFactory<SellerUser[], ISearchSellerUsersQuery>({
    load: async (query) => {
      const sellerId = await GetSellerId();
      const command = new SearchSellerUsersQuery({ ...(query || {}), sellerId: sellerId });

      return (await getApiClient()).searchSellerUsers(command);
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const route = useRoute();

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("TeamMemberDetails"),
      ...args,
    });
  }

  const scope: ListBaseBladeScope = {
    openDetailsBlade,
  };

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope,
  };
};
