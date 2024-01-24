import { IBladeToolbar, DynamicBladeForm } from "@vc-shell/framework";
import modules from "@vc-app/modules";
import { Ref, UnwrapRef, computed, ref } from "vue";
import * as _ from "lodash-es";
import { SellerProduct } from "@vc-app/api";

export type ExtendedOfferDetailsScope = UnwrapRef<
  ReturnType<typeof modules.Offers.composables.useOfferDetails>["scope"]
> & {
  toolbarOverrides: {
    showAlert: IBladeToolbar;
  };
};

export const useOfferDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"] & { options: { sellerProduct: SellerProduct } };
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): ReturnType<typeof modules.Offers.composables.useOfferDetails> => {
  const { load, saveChanges, remove, loading, item, validationState, scope, bladeTitle } =
    modules.Offers.composables.useOfferDetails(args);

  // Adding a new method that will be called by new toolbar button
  function clickMe() {
    alert("I'm alert!");
  }

  // Extending useOfferDetails 'scope' and adding a new 'showAlert' method representing 'method' key of new toolbar button:
  const extendedScope = _.merge(
    ref({}),
    ref(scope?.value),
    ref({
      toolbarOverrides: {
        showAlert: {
          clickHandler() {
            clickMe();
          },
          isVisible: true,
        },
      },
    }),
  ) as Ref<ExtendedOfferDetailsScope>;

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
