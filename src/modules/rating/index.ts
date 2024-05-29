import * as schema from "./pages";
import * as composables from "./composables";
import * as locales from "./locales";
import * as components from "./components";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({ schema, composables, locales, moduleComponents: components });

export { schema, composables, locales, components };
export type { ReviewDetailsScope, ReviewsListScope } from "./composables";
