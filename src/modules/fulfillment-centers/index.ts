import * as schema from "./pages";
import * as composables from "./composables";
import * as locales from "./locales";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({ schema, composables, locales });

export { schema, composables, locales };
