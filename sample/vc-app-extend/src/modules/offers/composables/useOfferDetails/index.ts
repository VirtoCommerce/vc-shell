import { IBladeToolbar, DetailsComposableArgs } from "@vc-shell/framework";
import modules from "@vc-app/modules";
import { UnwrapRef } from "vue";
import * as _ from "lodash-es";
import { SellerProduct } from "@vc-app/api";

export type ExtendedOfferDetailsScope = UnwrapRef<
  ReturnType<typeof modules.Offers.composables.useOfferDetails>["scope"]
> & {
  toolbarOverrides: {
    showAlert: IBladeToolbar;
  };
};

export const useOfferDetails = (
  args: DetailsComposableArgs<{ options: { sellerProduct: SellerProduct } }>,
): ReturnType<typeof modules.Offers.composables.useOfferDetails> => {
  const { load, saveChanges, remove, loading, item, validationState, scope, bladeTitle } =
    modules.Offers.composables.useOfferDetails(args);

  // Adding a new method that will be called by new toolbar button
  function clickMe() {
    alert("I'm alert!");
  }

  // Extending useOfferDetails 'scope' and adding a new 'showAlert' method representing 'method' key of new toolbar button:
  const extendedScope = _.merge(scope, {
    toolbarOverrides: {
      showAlert: {
        clickHandler() {
          clickMe();
        },
        isVisible: true,
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
    scope: extendedScope,
    bladeTitle,
  };
};
