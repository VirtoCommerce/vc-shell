import { useLogger, useUser } from "@virtoshell/core";
import {
  ISearchSellerUsersQuery,
  SearchSellerUsersQuery,
  SearchSellerUsersResult,
  SellerUser,
  VcmpSellerSecurityClient,
} from "../../../../api_client";
import { computed, Ref, ref } from "vue";

interface IUseTeamMembers {
  readonly loading: Ref<boolean>;
  readonly membersList: Ref<SellerUser[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  currentPage: Ref<number>;
  searchQuery: Ref<ISearchSellerUsersQuery>;
  getTeamMembers: (query: ISearchSellerUsersQuery) => void;
}

interface IUseTeamMembersOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseTeamMembersOptions): IUseTeamMembers => {
  const loading = ref(false);
  const logger = useLogger();
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchSellerUsersQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<SearchSellerUsersResult>();

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerSecurityClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getTeamMembers(query: ISearchSellerUsersQuery) {
    const client = await getApiClient();

    searchQuery.value = { ...searchQuery.value, ...query };

    const command = new SearchSellerUsersQuery(searchQuery.value);

    try {
      loading.value = true;
      searchResult.value = await client.searchSellerUsers(command);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: computed(() => loading.value),
    membersList: computed(() => searchResult.value?.results),
    totalCount: computed(() => searchResult.value?.totalCount),
    currentPage: computed(
      () => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1
    ),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    searchQuery,
    getTeamMembers,
  };
};
