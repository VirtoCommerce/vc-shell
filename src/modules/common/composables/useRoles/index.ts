import { AsyncAction, useApiClient, useUser, useLoading } from "@vc-shell/framework";
import { VcmpSellerSecurityClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, ref, computed } from "vue";

export interface IUseRoles {
  loading: ComputedRef<boolean>;
  getRoles: AsyncAction<void>;
  isAdministrator: ComputedRef<boolean>;
  isOperator: ComputedRef<boolean>;
}

export const useRoles = (): IUseRoles => {
  const { getApiClient } = useApiClient(VcmpSellerSecurityClient);
  const { loadUser } = useUser();

  const isAdministrator = ref(false);
  const isOperator = ref(false);
  const rolesLoading = ref(false);

  async function getRoles() {
    rolesLoading.value = true;
    isOperator.value = await (await getApiClient()).isOperator();
    const currentUser = await loadUser();
    isAdministrator.value = currentUser.isAdministrator ?? false;
    rolesLoading.value = false;
  }

  return {
    loading: useLoading(rolesLoading),
    getRoles,
    isAdministrator: computed(() => isAdministrator.value),
    isOperator: computed(() => isOperator.value),
  };
};
