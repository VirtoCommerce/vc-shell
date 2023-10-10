import { useApiClient, useDetailsFactory, DynamicBladeForm } from "@vc-shell/framework";
import {
  CreateSellerUserCommand,
  ISellerUserDetails,
  SearchSellerUsersQuery,
  SellerUser,
  SellerUserDetails,
  UpdateSellerUserCommand,
  VcmpSellerSecurityClient,
} from "../../../../api_client/marketplacevendor";
import { computed, onMounted, ref } from "vue";

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useTeamDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}) => {
  const factory = useDetailsFactory({
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

  const userDetails = computed({
    get() {
      return item.value || new SellerUser();
    },
    set(value) {
      item.value = value;
    },
  });

  const scope = ref({
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
    disableOnUser: computed(() => !!userDetails.value.id),
  });

  onMounted(() => {
    if (!args.props.param) {
      validationState.value.resetModified(userDetails.value, true);
    }
  });

  return {
    load,
    saveChanges,
    remove,
    loading,
    item: userDetails,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() =>
      args.props.param && userDetails.value.firstName && userDetails.value.lastName
        ? userDetails.value.firstName + " " + userDetails.value.lastName
        : "New member"
    ),
  };
};
