import { createDynamicAppModule } from "@vc-shell/framework";
import module from "vc-sample-modules";
import overrides from "./schemaOverride";

export default createDynamicAppModule({
  schema: module.Offers.schema,
  composables: module.Offers.composables,
  locales: module.Offers.locales,
  moduleComponents: module.Offers.components,
  overrides,
});
