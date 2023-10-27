import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import * as components from "./components";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({ schema, locales, composables, moduleComponents: components });

export { schema, composables, locales, components };
