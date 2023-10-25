import { createDynamicAppModule } from "@vc-shell/framework";
import modules from "vc-sample-modules";
import overrides from "./schemaOverride";
import { useOfferDetails } from "./composables";

export default createDynamicAppModule({
  schema: modules.Offers.schema,
  composables: {
    useOffersList: modules.Offers.composables.useOffersList,
    useOfferDetails,
  },
  locales: modules.Offers.locales,
  moduleComponents: modules.Offers.components,
  overrides, // <- imported 'overrides'
});
