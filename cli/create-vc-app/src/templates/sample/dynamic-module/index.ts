import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({ schema, locales, composables });

export { schema, composables, locales };
