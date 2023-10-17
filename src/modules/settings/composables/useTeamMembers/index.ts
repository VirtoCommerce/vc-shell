import { useUser } from "@vc-shell/framework";
import {
  CreateSellerUserCommand,
  ISearchSellerUsersQuery,
  ISellerUser,
  ISellerUserDetails,
  SearchSellerUsersQuery,
  SearchSellerUsersResult,
  SellerUser,
  SellerUserDetails,
  SendSellerUserInvitationCommand,
  UpdateSellerUserCommand,
  ValidateSellerUserQuery,
  ValidationFailure,
  VcmpSellerSecurityClient,
} from "vc-vendor-portal-api/marketplacevendor";
import { computed, Ref, ref, watch } from "vue";
import * as _ from "lodash-es";

interface IUseTeamMembers {
  readonly loading: Ref<boolean>;
  readonly membersList: Ref<SellerUser[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly modified: Ref<boolean>;
  currentPage: Ref<number>;
  searchQuery: Ref<ISearchSellerUsersQuery>;
  userDetails: Ref<SellerUserDetails & { id?: string }>;
  userDetailsCopy: Ref<SellerUserDetails>;
  getTeamMembers: (query: ISearchSellerUsersQuery) => void;
  createTeamMember: (details: ISellerUser, inviteStatus: boolean) => void;
  handleUserDetailsItem: (user: ISellerUser) => void;
  resetEntries: () => void;
  deleteTeamMember: (args: { id: string }) => void;
  updateTeamMember: (details: ISellerUser) => void;
  sendTeamMemberInvitation: (args: { id: string }) => void;
}

interface IUseTeamMembersOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseTeamMembersOptions): IUseTeamMembers => {
  const loading = ref(false);
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchSellerUsersQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<SearchSellerUsersResult>();
  const userDetails = ref(new SellerUserDetails());
  let userDetailsCopy: SellerUserDetails;
  const modified = ref(false);

  watch(
    () => userDetails,
    (state) => {
      modified.value = !_.isEqual(userDetailsCopy, state.value);
    },
    { deep: true }
  );

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
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createTeamMember(details: ISellerUserDetails, inviteStatus: boolean) {
    const client = await getApiClient();

    const command = new CreateSellerUserCommand({
      userDetails: new SellerUserDetails(details),
      sendInvitation: inviteStatus,
    });

    try {
      loading.value = true;
      const validationResult = await validateTeamMember(command.userDetails);
      if (validationResult.length && validationResult[0].errorCode === "EMAIL_ALREADY_EXISTS") {
        throw validationResult[0].errorCode;
      }

      await client.createSellerUser(command);
      modified.value = false;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateTeamMember(details: ISellerUser) {
    const client = await getApiClient();

    const command = new UpdateSellerUserCommand({
      sellerId: details.sellerId,
      sellerUserId: details.id,
      userDetails: new SellerUserDetails(details as ISellerUserDetails),
    });

    try {
      loading.value = true;
      await client.updateSellerUser(command);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function sendTeamMemberInvitation(args: { id: string }) {
    const client = await getApiClient();

    const command = new SendSellerUserInvitationCommand({
      sellerUserId: args.id,
    });

    try {
      loading.value = true;
      await client.sendUserInvitation(command);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTeamMember(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteSellerUsers([args.id]);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function handleUserDetailsItem(user: ISellerUser) {
    userDetails.value = Object.assign({}, new SellerUserDetails(user as ISellerUserDetails));
    userDetailsCopy = _.cloneDeep(userDetails.value);
  }

  async function validateTeamMember(details: SellerUserDetails): Promise<ValidationFailure[]> {
    const client = await getApiClient();

    const command = new ValidateSellerUserQuery({ sellerUser: details });

    try {
      return await client.validateUser(command);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function resetEntries() {
    userDetails.value = Object.assign({}, userDetailsCopy);
  }

  return {
    loading: computed(() => loading.value),
    membersList: computed(() => searchResult.value?.results),
    totalCount: computed(() => searchResult.value?.totalCount),
    currentPage: computed(() => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1),
    userDetailsCopy: computed(() => userDetailsCopy),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    modified: computed(() => modified.value),
    userDetails,
    searchQuery,
    getTeamMembers,
    createTeamMember,
    handleUserDetailsItem,
    resetEntries,
    deleteTeamMember,
    updateTeamMember,
    sendTeamMemberInvitation,
  };
};
