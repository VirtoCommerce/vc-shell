import * as schema from "./pages";
import * as composables from "./composables";
import * as components from "./components";
import * as locales from "./locales";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({ schema, composables, locales, moduleComponents: components });

export { schema, composables, components, locales };
