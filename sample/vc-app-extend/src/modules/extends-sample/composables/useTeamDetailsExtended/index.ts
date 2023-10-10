import module from "vc-sample-modules";
import { DynamicBladeForm, IBladeToolbar, UseDetails } from "@vc-shell/framework";
import { ref, computed } from "vue";
import { SellerUser } from "../../../../api_client/marketplacevendor";

export interface TeamExtendedBladeScope {
  toolbarOverrides: {
    overrideSampleFn: IBladeToolbar;
  };
}

export const useTeamDetailsExtended = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
}): UseDetails<SellerUser, TeamExtendedBladeScope> => {
  const { load, saveChanges, remove, loading, item, validationState, scope, bladeTitle } =
    module.SampleTeam.composables.useTeamDetails(args);

  function customMethod() {
    alert("Toolbar button clicked!");
  }

  const extendedScope = ref<TeamExtendedBladeScope & typeof scope.value>({
    ...scope.value,
    toolbarOverrides: {
      ...scope.value.toolbarOverrides,
      overrideSampleFn: {
        clickHandler() {
          customMethod();
        },
      },
    },
  });

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope: computed(() => extendedScope.value),
    bladeTitle,
  };
};
