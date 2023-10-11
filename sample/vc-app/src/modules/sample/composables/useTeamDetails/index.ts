import {
  useApiClient,
  useDetailsFactory,
  DynamicBladeForm,
  DetailsBaseBladeScope,
  UseDetails,
} from "@vc-shell/framework";
import {
  CreateSellerUserCommand,
  ISellerUserDetails,
  Image,
  SearchSellerUsersQuery,
  SellerUser,
  SellerUserDetails,
  UpdateSellerUserCommand,
  VcmpSellerSecurityClient,
} from "../../../../api_client/marketplacevendor";
import { ComputedRef, computed, onMounted, reactive, ref } from "vue";
import { useAssets } from "../../../common";

export interface TeamDetailsScope extends DetailsBaseBladeScope {
  roles: { id: string; name: string }[];
  disableOnUser: ComputedRef<boolean>;
  sampleButtonClick: () => void;
}

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useTeamDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}): UseDetails<SellerUser, TeamDetailsScope> => {
  const factory = useDetailsFactory<SellerUser>({
    load: async ({ id }) => {
      const command = new SearchSellerUsersQuery({ objectIds: [id] });

      return (await getApiClient()).searchSellerUsers(command).then((res) => res.results.find((x) => x.id === id));
    },
    saveChanges: async (details) => {
      return details.id
        ? (await getApiClient()).updateSellerUser(
            new UpdateSellerUserCommand({
              sellerId: details.sellerId,
              sellerUserId: details.id,
              userDetails: new SellerUserDetails(details as ISellerUserDetails),
            })
          )
        : (await getApiClient()).createSellerUser(
            new CreateSellerUserCommand({ userDetails: new SellerUserDetails(details as ISellerUserDetails) })
          );
    },
    remove: async ({ id }) => (await getApiClient()).deleteSellerUsers([id]),
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const scope = ref<TeamDetailsScope>({
    roles: [
      {
        id: "vcmp-admin-role",
        name: "Admin",
      },
      {
        id: "vcmp-agent-role",
        name: "Agent",
      },
    ],
    disableOnUser: computed(() => !!item.value?.id),
    sampleButtonClick: () => alert("Click!"),
    assetsHandler: {
      images: useAssets(Image),
    },
  });

  onMounted(() => {
    if (!args.props.param) {
      validationState.value.resetModified(reactive(new SellerUser()), true);
    }
  });

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() =>
      args.props.param && item.value?.firstName && item.value?.lastName
        ? item.value?.firstName + " " + item.value?.lastName
        : "New member"
    ),
  };
};
