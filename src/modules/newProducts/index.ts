import * as components from "./components";
import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import overrides from "./schemaOverride";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({
  schema,
  composables,
  moduleComponents: components,
  overrides,
  locales,
  menuConfig: {
    title: "Test menu",
    isVisible: true,
  },
});

export * from "./components";
export * from "./composables";
export * from "./pages";
