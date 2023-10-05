import { createDynamicAppModule } from "@vc-shell/framework";
import module from "vc-sample-modules";
import overrides from "./schemaOverride";
import { useTeamDetailsExtended } from "./composables";

export default createDynamicAppModule({
  schema: module.SampleTeam.schema,
  composables: {
    useTeamDetails: useTeamDetailsExtended,
    useTeamList: module.SampleTeam.composables.useTeamList,
  },
  locales: module.SampleTeam.locales,
  moduleComponents: module.SampleTeam.components,
  overrides,
});
