import {
  useApiClient,
  useDetailsFactory,
  DetailsComposableArgs,
  DetailsBaseBladeScope,
  UseDetails,
  usePopup,
  IBladeToolbar,
  useAsync,
  useLoading,
  useUser,
  useAssets,
  ICommonAsset,
} from "@vc-shell/framework";
import {
  CreateSellerUserCommand,
  ISellerUserDetails,
  SearchSellerUsersQuery,
  SellerUser,
  SellerUserDetails,
  SendSellerUserInvitationCommand,
  UpdateSellerUserCommand,
  ValidateSellerUserQuery,
  ValidationFailure,
  VcmpSellerSecurityClient,
  IImage,
  Image,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, reactive, ref, watch, WritableComputedRef, ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import { roles } from "../../common";
import { useRoute } from "vue-router";

export interface TeamDetailsScope extends DetailsBaseBladeScope {
  photoHandler: WritableComputedRef<{ url: string; name: string; title: string }[]>;
  toolbarOverrides: {
    sendInvite: IBladeToolbar;
    saveChanges: IBladeToolbar;
    reset: IBladeToolbar;
    remove: IBladeToolbar;
    resendInvite: IBladeToolbar;
  };
  assetsHandler: {
    images: {
      noRemoveConfirmation: boolean;
      loading: ComputedRef<boolean>;
      upload(files: FileList): Promise<Image[]>;
      remove: (files: IImage[]) => ICommonAsset[];
    };
  };
}

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useTeamDetails = (args: DetailsComposableArgs): UseDetails<SellerUser, TeamDetailsScope> => {
  const factory = useDetailsFactory<SellerUser>({
    load: async (item) => {
      if (item?.id) {
        const sellerId = await GetSellerId();
        const command = new SearchSellerUsersQuery({
          sellerId: sellerId,
          objectIds: [item.id],
        });

        return (await getApiClient())
          .searchSellerUsers(command)
          .then((res) => res.results?.find((x) => x.id === item.id));
      }
    },
    saveChanges: async (details) => {
      const sellerId = await GetSellerId();
      if (details.id) {
        return (await getApiClient()).updateSellerUser(
          new UpdateSellerUserCommand({
            sellerId: details.sellerId,
            sellerUserId: details.id,
            userDetails: new SellerUserDetails(details as ISellerUserDetails),
          }),
        );
      } else {
        const validationResult = await validateTeamMember(details);
        if (validationResult.length && validationResult[0].errorCode === "EMAIL_ALREADY_EXISTS") {
          throw validationResult[0].errorCode;
        }
        return await (
          await getApiClient()
        ).createSellerUser(
          new CreateSellerUserCommand({
            sellerId: sellerId,
            userDetails: new SellerUserDetails(details as ISellerUserDetails),
            sendInvitation: sendInviteStatus.value,
          }),
        );
      }
    },
    remove: async ({ id }) => {
      if (args.props.param) {
        return await (await getApiClient()).deleteSellerUsers([id]);
      }
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();
  const { showError, showConfirmation } = usePopup();
  const { user } = useUser();
  const { t } = useI18n({ useScope: "global" });
  const route = useRoute();
  const { upload: uploadImage, remove: removeImage, loading: imageLoading } = useAssets();

  const sendInviteStatus = ref(false);
  const isOwnerReadonly = computed(() => item.value?.role === "vcmp-owner-role");
  const isCurrentUser = computed(() => item.value?.userName === user.value?.userName);
  const isCurrentUserOwner = computed(
    () => item.value?.userName === user.value?.userName && item.value?.role === "vcmp-owner-role",
  );

  const role = computed(
    () => roles.value.find((x) => x.id === item.value?.role) || roles.value.find((x) => x.id === "vcmp-agent-role"),
  );

  const isActive = computed({
    get: () => item.value?.isLockedOut,
    set: (val) => {
      (item.value as SellerUserDetails).isLockedOut = val;
    },
  });

  const photoHandler = computed({
    get() {
      return item.value?.iconUrl ? [{ url: item.value.iconUrl, name: user.value?.userName ?? "", title: "" }] : [];
    },
    set(value) {
      if (value) {
        item.value!.iconUrl = value.find(() => true)?.url;
      } else {
        item.value!.iconUrl = undefined;
      }
    },
  });

  const scope: TeamDetailsScope = {
    sendInviteStatus,
    isActive,
    isOwnerReadonly: computed(() => isOwnerReadonly.value && !isCurrentUserOwner.value),
    photoHandler,
    disableOnCurrent: computed(() => isCurrentUser.value || isOwnerReadonly.value),
    isActiveSwitchVisible: computed(() => !!item.value?.id),
    isActiveSwitchHidden: computed(() => !item.value?.id),
    roles: computed(() =>
      roles.value.filter((x) => {
        if (item.value?.role === x.id) return x;
        else return x.id !== "vcmp-owner-role";
      }),
    ),
    disableOnUser: computed(() => !!item.value?.id),
    assetsHandler: {
      images: {
        noRemoveConfirmation: true,
        loading: imageLoading,
        async upload(files: FileList) {
          return (await uploadImage(files, `vendors/${item.value?.sellerId}/users`)).map((x) => new Image(x));
        },
        remove: (files: IImage[]) => {
          return removeImage(files, photoHandler.value);
        },
      },
    },
    toolbarOverrides: {
      sendInvite: {
        clickHandler: async () => {
          try {
            await saveChanges(item.value);
            args.emit("parent:call", {
              method: "reload",
            });
            args.emit("close:blade");
          } catch (e: unknown) {
            if (e === "EMAIL_ALREADY_EXISTS") {
              showEmailExistsError();
            } else {
              throw e;
            }
          }
        },
        isVisible: !args.props.param,
        disabled: computed(() => !(!validationState.value.disabled && validationState.value.modified)),
      },
      saveChanges: {
        clickHandler: async () => {
          try {
            await saveChanges(item.value);
            args.emit("parent:call", {
              method: "reload",
            });
            args.emit("close:blade");
          } catch (e) {
            if (e === "EMAIL_ALREADY_EXISTS") {
              showEmailExistsError();
            }
          }
        },
        isVisible: !!args.props.param,
        disabled: computed(() => !(!validationState.value.disabled && validationState.value.modified)),
      },
      reset: {
        clickHandler: () => {
          validationState.value.resetModified(validationState.value.cachedValue, true);
        },
        isVisible: !!args.props.param,
        disabled: computed(() => !!args.props.param && !validationState.value.modified),
      },
      remove: {
        clickHandler: async () => {
          if (await showConfirmation(computed(() => t("TEAM.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")))) {
            if (item.value?.id) remove?.({ id: item.value?.id });
          }
        },
        isVisible: !!args.props.param,
        disabled: computed(() => isOwnerReadonly.value || isCurrentUser.value),
      },
      resendInvite: {
        clickHandler: async () => {
          if (item.value?.id) {
            try {
              await sendTeamMemberInvitation({ id: item.value?.id });
              args.emit("close:blade");
            } catch (e) {
              console.error(e);
              throw e;
            }
          }
        },
        isVisible: !!args.props.param,
        disabled: computed(() => isOwnerReadonly.value || !!item.value?.email),
      },
    },
  };

  function showEmailExistsError() {
    showError(
      t("TEAM.PAGES.DETAILS.POPUP.ERROR.MESSAGE.USER_EXIST", {
        email: item.value?.email,
      }),
    );
  }

  const { loading: resendInviteLoading, action: sendTeamMemberInvitation } = useAsync<{ id: string }>(async (args) => {
    if (args && args.id) {
      const command = new SendSellerUserInvitationCommand({
        sellerUserId: args.id,
      });

      return await (await getApiClient()).sendUserInvitation(command);
    }
  });

  const { loading: validateTeamMemberLoading, action: validateTeamMember } = useAsync<SellerUser, ValidationFailure[]>(
    async (details) => {
      const command = new ValidateSellerUserQuery({ sellerUser: details });

      return await (await getApiClient()).validateUser(command);
    },
  );

  watch(
    () => args?.mounted.value,
    async () => {
      if (!args.props.param) {
        item.value = reactive(new SellerUserDetails());
        item.value.role = role.value?.id ?? "";
        validationState.value.resetModified(item.value, true);
      }
    },
  );

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    saveChanges,
    remove,
    loading: useLoading(loading, resendInviteLoading, validateTeamMemberLoading),
    item,
    validationState,
    scope,
    bladeTitle: computed(() =>
      args.props.param && item.value?.firstName && item.value.lastName
        ? item.value.firstName + " " + item.value.lastName
        : (t("TEAM.PAGES.DETAILS.TITLE") as string),
    ),
  };
};
