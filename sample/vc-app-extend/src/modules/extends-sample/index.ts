import { createDynamicAppModule } from "@vc-shell/framework";
import module from "vc-sample-modules";
import overrides from "./schemaOverride";
import { useTeamDetailsExtended } from "./composables";

export default createDynamicAppModule({
  schema: module.SampleModule.schema,
  composables: {
    useTeamDetails: useTeamDetailsExtended,
    useTeamList: module.SampleModule.composables.useTeamList,
  },
  locales: module.SampleModule.locales,
  moduleComponents: module.SampleModule.components,
  overrides,
});
